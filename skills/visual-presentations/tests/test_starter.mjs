// Run from a directory with Playwright installed; CHROME_PATH is optional.
import assert from 'node:assert/strict';
import {mkdtemp, cp, readFile, writeFile, rm, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(join(process.cwd(),'package.json'));
const {chromium}=require('playwright');
const temp=await mkdtemp(join(tmpdir(),'visual-presentations-test-'));
const run=(command,args)=>spawnSync(command,args,{encoding:'utf8',env:process.env});
try {
  const good=join(temp,'good'),bad=join(temp,'bad');
  await cp(join(root,'templates/starter'),good,{recursive:true});
  const index=join(good,'index.html');
  await writeFile(index,(await readFile(index,'utf8')).replaceAll(' data-placeholder',''));
  let result=run('python3',[join(root,'scripts/bundle.py'),index,'--out',join(good,'presentation.html')]);
  assert.equal(result.status,0,result.stderr);
  result=run('node',[join(root,'scripts/check_deck.mjs'),join(good,'presentation.html')]);
  assert.equal(result.status,0,result.stdout+result.stderr);
  const report=JSON.parse(await readFile(join(good,'checks/report.json'),'utf8'));
  assert.equal(report.count,2);assert.equal(report.errors.length,0);
  assert.equal(report.navigation,true);assert.equal(report.notesOpen,true);
  assert.ok(report.viewports.every(v=>v.fit));
  result=run('python3',[join(root,'scripts/bundle.py'),index,'--out',join(good,'preview.html'),'--inline-preview']);
  assert.equal(result.status,0,result.stderr);
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    const page=await browser.newPage({viewport:{width:728,height:900}});
    await page.goto(pathToFileURL(join(good,'preview.html')).href);
    await page.waitForFunction(()=>window.deck?.isReady());
    const height=await page.locator('.reveal').evaluate(el=>el.getBoundingClientRect().height);
    assert.ok(Math.abs(height-409.5)<1,`Inline preview height ${height}`);
  } finally {await browser.close();}
  await mkdir(bad);
  const malformed=(await readFile(join(good,'presentation.html'),'utf8'))
    .replace('Presentation title</h1>','Presentation title.</h1><img src="missing.png" alt="Missing test image">')
    .replace('</head>','<style>.reveal{position:relative;height:auto;aspect-ratio:16/9}</style></head>');
  await writeFile(join(bad,'presentation.html'),malformed);
  result=run('node',[join(root,'scripts/check_deck.mjs'),join(bad,'presentation.html')]);
  assert.equal(result.status,1,result.stdout+result.stderr);
  const failure=JSON.parse(await readFile(join(bad,'checks/report.json'),'utf8'));
  assert.ok(failure.errors.some(e=>e.includes('trailing periods')));
  assert.ok(failure.errors.some(e=>e.includes('broken images')));
  assert.ok(failure.errors.some(e=>e.includes('1920×900')));
  console.log('PASS: offline starter, navigation, notes, four viewports, inline sizing, and deliberate punctuation/image/overflow failures');
} finally {await rm(temp,{recursive:true,force:true});}
