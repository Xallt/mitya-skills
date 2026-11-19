const notes = document.getElementById('speaker-notes');
const toc = document.getElementById('toc');
const deck = new Reveal(document.querySelector('.reveal'), {
  embedded: true, width: 1600, height: 900, margin: 0,
  minScale: .1, maxScale: 2, scrollActivationWidth: 0,
  center: false, hash: true, controls: true, progress: true,
  slideNumber: 'c/t', transition: 'none', backgroundTransition: 'none',
  keyboardCondition: () => !notes.open,
});
window.deck = deck;
function refreshNotes() {
  const slide = deck.getCurrentSlide();
  document.getElementById('notes-title').textContent = slide.dataset.title || '';
  document.getElementById('notes-content').innerHTML = slide.querySelector('.notes')?.innerHTML || '';
}
function closeNotes() { notes.close(); document.querySelector('.reveal').focus(); }
document.getElementById('close-notes').addEventListener('click', closeNotes);
document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    if (notes.open) closeNotes();
    else { refreshNotes(); notes.showModal(); }
  }
});
deck.on('slidechanged', () => { if (notes.open) refreshNotes(); });
deck.initialize().then(() => {
  const viewport = document.querySelector('.reveal');
  viewport.tabIndex = 0; viewport.focus();
});
// Contents beside Reveal's overview (Escape): the title, then one heading per .brk section slide.
function link(text, index, head) {
  const a = document.createElement('a');
  a.textContent = text; a.dataset.index = index;
  if (head) a.className = 'toc-head';
  if (index === deck.getIndices().h) a.classList.add('here');
  return a;
}
function buildToc() {
  const list = document.getElementById('toc-list');
  list.innerHTML = '';
  let group = null;
  deck.getSlides().forEach(slide => {
    if (slide.dataset.visibility === 'hidden') return;
    const index = deck.getIndices(slide).h;
    const heading = slide.querySelector('h1, h2')?.textContent || slide.dataset.title || '';
    if (index === 0) { list.append(link(heading, 0, true)); return; }
    if (!group || slide.classList.contains('brk')) {
      group = document.createElement('section');
      const name = slide.classList.contains('brk') ? heading : slide.querySelector('.kicker')?.textContent || heading;
      group.append(link(name, index, true));
      list.append(group);
      if (slide.classList.contains('brk')) return;
    }
    group.append(link(`${index + 1} · ${heading}`, index, false));
  });
}
document.getElementById('toc-list').addEventListener('click', event => {
  const a = event.target.closest('a');
  if (!a) return;
  deck.toggleOverview(false);
  deck.slide(+a.dataset.index, 0, -1);
  document.querySelector('.reveal').focus();
});
deck.on('overviewshown', () => { buildToc(); toc.hidden = false; document.body.classList.add('toc-on'); deck.layout(); });
deck.on('overviewhidden', () => { toc.hidden = true; document.body.classList.remove('toc-on'); deck.layout(); });

// Light/dark palette over the same slides; the switch sits in the Esc contents panel.
// Charts are drawn in the CHART_INK hexes and recoloured here to the active palette.
const CHART_INK = {
  '#f3f7fa': '--deck-text', '#9babb9': '--deck-muted', '#24394a': '--deck-grid', '#0b1520': '--deck-bg',
  '#38bdf8': '--deck-cyan', '#50d99a': '--deck-green', '#f5b85c': '--deck-amber', '#ff667d': '--deck-red',
};
const inkPattern = new RegExp(Object.keys(CHART_INK).join('|'), 'gi');
const chartSvgs = new Map();
async function loadChartSvgs() {
  await Promise.all([...document.querySelectorAll('.reveal img')].map(async img => {
    const src = img.getAttribute('src') || '';
    if (!/^data:image\/svg\+xml|\.svg$/i.test(src)) return;
    try {
      if (src.startsWith('data:')) {
        const [head, body] = src.split(',');
        chartSvgs.set(img, head.endsWith(';base64') ? new TextDecoder().decode(Uint8Array.from(atob(body), c => c.charCodeAt(0))) : decodeURIComponent(body));
      } else chartSvgs.set(img, await (await fetch(src)).text());
    } catch { /* an unbundled file:// deck cannot read its SVGs; they keep their drawn colours */ }
  }));
  for (const el of document.querySelectorAll('.reveal svg [fill], .reveal svg [stroke], .reveal svg [stop-color]'))
    for (const attr of ['fill', 'stroke', 'stop-color']) {
      const value = el.getAttribute(attr)?.toLowerCase();
      if (CHART_INK[value]) el.style.setProperty(attr, `var(${CHART_INK[value]})`);
    }
}
function recolorCharts() {
  const style = getComputedStyle(document.documentElement);
  for (const [img, svg] of chartSvgs)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(inkPattern, hex => style.getPropertyValue(CHART_INK[hex.toLowerCase()]).trim()));
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('deck-theme', theme); } catch { /* storage may be blocked */ }
  for (const b of document.querySelectorAll('#theme-switch button')) b.setAttribute('aria-pressed', String(b.dataset.theme === theme));
  recolorCharts();
}
let savedTheme = null;
try { savedTheme = localStorage.getItem('deck-theme'); } catch { /* storage may be blocked */ }
const initialTheme = new URLSearchParams(location.search).get('theme') || savedTheme || 'dark';
document.documentElement.dataset.theme = initialTheme;
document.getElementById('theme-switch').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button) setTheme(button.dataset.theme);
});
loadChartSvgs().then(() => setTheme(initialTheme));
