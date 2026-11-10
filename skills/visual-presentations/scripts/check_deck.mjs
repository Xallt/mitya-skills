#!/usr/bin/env node
// Generic checks; custom animations still need their own behavior checks.
import {createRequire} from 'node:module';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
const input = process.argv[2];
if (!input) { console.error('Usage: node check_deck.mjs presentation.html'); process.exit(2); }
const require = createRequire(join(process.cwd(), 'package.json'));
let chromium;
try { ({chromium} = require('playwright')); }
catch { console.error('Playwright is required in the current directory: npm install --no-save playwright'); process.exit(2); }
const file = resolve(input), output = join(dirname(file), 'checks');
await mkdir(output, {recursive: true});
const browser = await chromium.launch({headless: true, ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
const errors = [], warnings = [], pages = [], network = [];
try {
  const page = await browser.newPage({viewport: {width: 1600, height: 900}});
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    if (/^https?:/.test(route.request().url())) { network.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await page.goto(pathToFileURL(file).href);
  await page.waitForFunction(() => window.deck?.isReady(), {}, {timeout: 10000});
  await page.evaluate(() => deck.configure({transition: 'none'}));
  const count = await page.evaluate(() => deck.getTotalSlides());
  const nested = await page.locator('.slides section section').count();
  if (nested) errors.push('Nested slides require an extended traversal check');
  for (let index = 0; index < count && !nested; index++) {
    await page.evaluate(index => deck.slide(index, 0, -1), index);
    await page.evaluate(() => Promise.all([...deck.getCurrentSlide().querySelectorAll('img')].map(img => img.decode().catch(() => {}))));
    const state = await page.evaluate(() => {
      const slide = deck.getCurrentSlide(), box = slide.getBoundingClientRect();
      const text = [...slide.querySelectorAll('h1,h2,h3,[data-one-line]')].filter(e => e.textContent.trim().endsWith('.')).map(e => e.textContent.trim());
      const suspect = [...slide.querySelectorAll('*')].filter(e => !e.children.length && !e.closest('.notes,script,style') && e.textContent.trim().endsWith('.') && e.textContent.trim().length < 100 && !e.matches('h1,h2,h3,[data-one-line]')).map(e => e.textContent.trim());
      const outside = [...slide.querySelectorAll('h1,h2,h3,p,figure,img,[data-one-line]')].filter(e => {
        if (e.closest('.notes')) return false;
        const r = e.getBoundingClientRect(), style = getComputedStyle(e);
        return style.visibility !== 'hidden' && style.display !== 'none' && r.width > 0 && (r.left < box.left - 1 || r.top < box.top - 1 || r.right > box.right + 1 || r.bottom > box.bottom + 1);
      }).map(e => e.tagName + ': ' + (e.textContent || e.getAttribute('alt') || '').trim().slice(0, 80));
      return {title: slide.dataset.title, text, suspect, outside, placeholders: slide.querySelectorAll('[data-placeholder]').length,
        brokenImages: [...slide.querySelectorAll('img')].filter(img => !img.complete || !img.naturalWidth).map(img => img.alt),
        notes: !!slide.querySelector('.notes')?.textContent.trim()};
    });
    pages.push(state);
    if (state.text.length) errors.push(`Slide ${index + 1}: trailing periods in ${JSON.stringify(state.text)}`);
    if (state.suspect.length) warnings.push(`Slide ${index + 1}: inspect possible one-line punctuation ${JSON.stringify(state.suspect)}`);
    if (state.outside.length) errors.push(`Slide ${index + 1}: content outside slide ${JSON.stringify(state.outside)}`);
    if (state.placeholders) errors.push(`Slide ${index + 1}: ${state.placeholders} starter placeholders remain`);
    if (state.brokenImages.length) errors.push(`Slide ${index + 1}: broken images ${JSON.stringify(state.brokenImages)}`);
    if (!state.notes) warnings.push(`Slide ${index + 1}: no speaker notes`);
    await page.screenshot({path: join(output, `slide-${index + 1}.png`)});
  }
  const viewports = [];
  for (const [width, height] of [[1600,900],[1920,900],[1366,768],[390,844]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(() => deck.layout());
    for (let index = 0; index < count && !nested; index++) {
      await page.evaluate(index => deck.slide(index,0,-1),index);
      const fit = await page.evaluate(() => {
        const r = deck.getCurrentSlide().getBoundingClientRect();
        return document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
      });
      viewports.push({width,height,slide:index+1,fit});
      if (!fit) errors.push(`Slide ${index + 1}: does not fit ${width}×${height}`);
    }
  }
  await page.setViewportSize({width:1600,height:900});
  await page.evaluate(() => {deck.layout();deck.slide(0,0,-1);document.querySelector('.reveal').focus();});
  const initial = await page.evaluate(() => JSON.stringify(deck.getIndices()));
  await page.keyboard.press('ArrowRight');
  const navigation = count < 2 || initial !== await page.evaluate(() => JSON.stringify(deck.getIndices()));
  if (!navigation) errors.push('ArrowRight did not advance');
  await page.keyboard.press('n');
  const notesOpen = await page.locator('#speaker-notes').evaluate(el => el.open).catch(() => false);
  if (!notesOpen) errors.push('N did not open speaker notes');
  await page.keyboard.press('n');
  if (network.length) errors.push(`Runtime requested network assets: ${JSON.stringify([...new Set(network)])}`);
  const report = {file,count,pages,viewports,navigation,notesOpen,errors,warnings};
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({slides:count,errors,warnings,output},null,2));
  if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
