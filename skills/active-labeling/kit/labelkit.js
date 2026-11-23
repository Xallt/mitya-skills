/* labelkit: shared client for active-labeling pages (served by kit/server.py).
 *
 * What every page gets:
 *  - One screen: the sample and every control fit the window. Only long text scrolls, inside its own box.
 *  - Eager: every action changes the screen at once. Saves go through an outbox kept in localStorage that retries
 *    until the server confirms; state polling (ETag) and prefetch of the next samples run in the background.
 *    Nothing waits on the network. The header pill shows saved / saving / unsaved+retrying.
 *  - Every image is a viewer: wheel/pinch zoom at the cursor, drag pan, double-click reset, full window, + / -.
 *    Overlays are vectors drawn at screen resolution (never baked into pixels); `o` toggles them.
 *  - Keys for everything, all listed under `?`.
 *  - Polling never touches what the user is typing; unsaved notes survive polls, navigation and reloads.
 *  - Priors (reveal) show only on samples already answered.
 *
 * A project supplies page.js that calls LK.start(config). See README.md.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NS = `lk:${location.host}${location.pathname}:`;
const store = {
  get(k, d) { try { const v = localStorage.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch { /* private mode: in-memory only */ } },
};
const timeout = ms => (AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined);

let cfg = null;
let S = { queue: { order: [], messages: [] }, items: {}, labels: {} };
let etag = null, loaded = false, idx = 0, shownId, showHist = false, online = true, agentHTML = null;

// ---------------------------------------------------------------- labels: server state + optimistic outbox
let outbox = store.get('outbox', []);      // label ops the server has not confirmed yet, oldest first
const drafts = store.get('drafts', {});    // unsaved note text per sample
let inflight = null, fails = 0, lastErr = '', flushTimer = null;
const order = () => S.queue.order || [];
const cur = () => order()[idx];
function labelOf(id) {
  for (let k = outbox.length - 1; k >= 0; k--) if (outbox[k].id === id) return outbox[k];
  return S.labels[id];
}
function enqueue(op) {
  outbox = outbox.filter(o => o.id !== op.id || o === inflight);   // only the newest op per sample matters
  outbox.push(op);
  store.set('outbox', outbox);
  flushSoon(0);
}
function flushSoon(ms) { clearTimeout(flushTimer); flushTimer = setTimeout(flush, ms); }
async function flush() {
  if (inflight || !outbox.length) return chrome();
  inflight = outbox[0];
  try {
    const r = await fetch('api/label', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                         body: JSON.stringify(inflight), signal: timeout(10000) });
    if (r.status >= 500) throw new Error('HTTP ' + r.status);
    if (r.ok) S.labels[inflight.id] = { verdict: inflight.verdict, note: inflight.note, client_at: inflight.client_at };
    else lastErr = `server rejected ${inflight.id} (HTTP ${r.status})`;   // can never succeed: drop, keep the message
    outbox = outbox.filter(o => o !== inflight);
    store.set('outbox', outbox);
    fails = 0;
  } catch (e) {
    fails++;
    lastErr = e.name === 'TimeoutError' || e.name === 'AbortError' ? 'timeout' : (e.message || String(e));
  }
  inflight = null;
  chrome();
  if (outbox.length) flushSoon(fails ? Math.min(30000, 500 * 2 ** Math.min(fails, 6)) : 0);
}

// ---------------------------------------------------------------- polling (cheap: 304 when nothing changed)
async function poll() {
  try {
    const r = await fetch('api/state', { cache: 'no-store', headers: etag ? { 'If-None-Match': etag } : {}, signal: timeout(10000) });
    if (!r.ok && r.status !== 304) throw new Error('HTTP ' + r.status);
    online = true;
    if (r.status !== 304) { const n = await r.json(); etag = r.headers.get('ETag'); merge(n); }
    if (outbox.length && !inflight) flushSoon(0);   // the server answers: retry pending saves now
  } catch { online = false; }
  chrome();
}
async function pollLoop() { await poll(); setTimeout(pollLoop, cfg.pollMs); }
function merge(n) {
  const was = cur()?.id, before = order().length, wasDone = was != null && !!labelOf(was);
  S = { queue: n.queue || { order: [], messages: [] }, items: n.items || {}, labels: n.labels || {} };
  if (!loaded) {
    loaded = true;
    const k = order().findIndex(o => !labelOf(o.id));
    idx = k >= 0 ? k : 0;
  } else if (was != null) {
    const k = order().findIndex(o => o.id === was);
    if (k >= 0) idx = k;
    if (wasDone && order().length > before) {         // current one is done and new samples arrived: go there
      const j = order().findIndex((o, k2) => k2 >= before && !labelOf(o.id));
      if (j >= 0) idx = j;
    }
  }
  render();
}

// ---------------------------------------------------------------- navigation + rendering (synchronous)
function render() { if ((cur()?.id ?? null) !== shownId) showItem(); else chrome(); }
function showItem() {
  const o = cur();
  shownId = o?.id ?? null;
  closeFull();
  viewers.clear();
  hovered = null;
  const v = $('lk-views');
  v.innerHTML = '';
  if (!o) {
    $('lk-q').textContent = loaded ? 'Queue empty — waiting for the agent.' : 'Loading…';
    $('lk-meta').innerHTML = '';
    $('lk-note').value = '';
    return chrome();
  }
  const it = S.items[o.id] || {};
  $('lk-q').innerHTML = cfg.question ? cfg.question(it, o) : '';
  $('lk-meta').innerHTML = cfg.meta ? cfg.meta(it, o) : '';
  $('lk-note').value = drafts[o.id] ?? (labelOf(o.id)?.note || '');
  try { cfg.renderItem(v, it, o); } catch (e) { v.textContent = 'render error: ' + e.message; console.error(e); }
  chrome();
  prefetchAround();
}
function chrome() {
  const N = order().length, done = order().filter(o => labelOf(o.id)).length, o = cur(), L = o && labelOf(o.id);
  $('lk-pos').textContent = N ? `${idx + 1} / ${N}` : '0';
  $('lk-done').textContent = `${done} labeled`;
  const el = $('lk-save'), n = outbox.length;
  if (!n) { el.textContent = online ? '✓ saved' : '✓ saved · server unreachable'; el.className = 'pill ' + (online ? 'ok' : 'warn'); }
  else if (fails < 2) { el.textContent = `saving ${n}…`; el.className = 'pill warn'; }
  else { el.textContent = `${n} unsaved · retrying (${lastErr})`; el.className = 'pill bad'; }
  if (!n && lastErr.startsWith('server rejected')) { el.textContent += ' · ' + lastErr; el.className = 'pill bad'; }
  const msgs = S.queue.messages || [], last = msgs[msgs.length - 1];
  const a = (S.queue.busy ? '<span class="busy">agent analyzing</span>\n' : '') +
    (showHist ? msgs.map(m => `[${esc(m.at)}] ${m.text}`).join('\n\n') : (last ? '<b>Agent:</b> ' + last.text : '(no message yet)'));
  if (a !== agentHTML) { $('lk-agent').innerHTML = a; agentHTML = a; }   // untouched when unchanged: keeps its scroll
  document.querySelectorAll('#lk-verdicts button').forEach(b => b.classList.toggle('chosen', !!L && L.verdict === b.dataset.v));
  const rv = $('lk-reveal');
  if (o && L && cfg.reveal) { rv.hidden = false; rv.innerHTML = cfg.reveal(S.items[o.id] || {}, o); } else rv.hidden = true;
}
function go(j) { const N = order().length; if (!N) return; idx = Math.max(0, Math.min(N - 1, j)); render(); }
function nextOpen() {
  const N = order().length;
  for (let k = 1; k <= N; k++) { const j = (idx + k) % N; if (!labelOf(order()[j].id)) { idx = j; return render(); } }
  render();
}
function save(verdict) {
  const o = cur();
  if (!o) return;
  enqueue({ id: o.id, verdict, note: $('lk-note').value.trim(), client_at: new Date().toISOString() });
  delete drafts[o.id];
  store.set('drafts', drafts);
  $('lk-note').blur();
  nextOpen();   // the screen moves on now; the save happens behind it
}
function saveNote() { const o = cur(); if (o) save(labelOf(o.id)?.verdict ?? null); }
function prefetchAround() {
  if (!cfg.prefetch) return;
  const N = order().length, pick = [];
  for (let k = 1; k <= N && pick.length < cfg.prefetchAhead; k++) { const o = order()[(idx + k) % N]; if (!labelOf(o.id)) pick.push(o); }
  if (idx + 1 < N) pick.push(order()[idx + 1]);
  if (idx > 0) pick.push(order()[idx - 1]);
  for (const o of pick) { try { Promise.resolve(cfg.prefetch(S.items[o.id] || {}, o)).catch(() => {}); } catch { /* best effort */ } }
}

// ---------------------------------------------------------------- asset cache
const _img = {}, _json = {};
function image(src, fresh) {
  if (fresh || !_img[src]) { const im = new Image(); im.decoding = 'async'; im.src = src; _img[src] = im; }
  return _img[src];
}
function json(url) {
  if (!_json[url]) {
    _json[url] = (async () => {
      for (let t = 0; ; t++) {
        try {
          const r = await fetch(url, { signal: timeout(15000) });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return await r.json();
        } catch (e) {
          if (t >= 5) { delete _json[url]; throw e; }
          await new Promise(z => setTimeout(z, 600 * (t + 1)));
        }
      }
    })();
  }
  return _json[url];
}

// ---------------------------------------------------------------- image viewer
// screen = (X + K*u, Y + K*v) for image pixel (u, v). opt: {src, w, h, start: {center: [u, v], span}, draw(c, T), maxZoom}
// draw() gets T = {x(u), y(v), k} and paints vectors in screen space, so lines stay crisp at any zoom.
const viewers = new Set();
let hovered = null, overlayOn = true, fullApi = null;
function viewer(box, opt) {
  box.classList.add('lk-zv');
  box.innerHTML = '<canvas></canvas><span class="zb" hidden></span><span class="lk-msg">loading…</span>';
  const cv = box.querySelector('canvas'), badge = box.querySelector('.zb'), msg = box.querySelector('.lk-msg');
  const maxZoom = opt.maxZoom || 80;
  let im = image(opt.src), W = opt.w || 0, H = opt.h || 0, K0 = 1, K = 1, X = 0, Y = 0;
  let drag = null, raf = 0, tries = 0, moved = false, ready = false;
  const bw = () => box.clientWidth, bh = () => box.clientHeight;
  const dims = () => { if (!W && im.naturalWidth) { W = im.naturalWidth; H = im.naturalHeight; } return W > 0 && H > 0; };
  function home() {
    if (!bw() || !bh() || !dims()) return;
    K0 = Math.min(bw() / W, bh() / H);
    const s = opt.start;
    if (s && s.center) {
      K = Math.max(K0, Math.min(bw(), bh()) / (s.span || Math.min(W, H) / 4));
      X = bw() / 2 - K * s.center[0]; Y = bh() / 2 - K * s.center[1];
    } else { K = K0; X = 0; Y = 0; }
    ready = true; moved = false;
    apply();
  }
  function clamp() {
    K = Math.min(K0 * maxZoom, Math.max(K0, K));
    const w = K * W, h = K * H;
    X = w <= bw() ? (bw() - w) / 2 : Math.min(0, Math.max(bw() - w, X));
    Y = h <= bh() ? (bh() - h) / 2 : Math.min(0, Math.max(bh() - h, Y));
  }
  function apply() {
    if (!ready) return home();
    clamp();
    const z = K / K0;
    badge.hidden = z < 1.05;
    badge.textContent = '×' + z.toFixed(1);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }
  function zoomAt(cx, cy, f) {
    if (!ready) return;
    const nk = Math.min(K0 * maxZoom, Math.max(K0, K * f));
    X = cx - (cx - X) * nk / K; Y = cy - (cy - Y) * nk / K; K = nk; moved = true;
    apply();
  }
  const T = { x: u => X + K * u, y: v => Y + K * v, get k() { return K; } };
  function draw() {
    const w = bw(), h = bh(), d = devicePixelRatio || 1;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    c.clearRect(0, 0, w, h);
    if (im.complete && im.naturalWidth) {   // draw only the visible part of the image
      const sx = im.naturalWidth / W, sy = im.naturalHeight / H;
      const u0 = Math.max(0, -X / K), v0 = Math.max(0, -Y / K), u1 = Math.min(W, (w - X) / K), v1 = Math.min(H, (h - Y) / K);
      if (u1 > u0 && v1 > v0) {
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(im, u0 * sx, v0 * sy, (u1 - u0) * sx, (v1 - v0) * sy, X + K * u0, Y + K * v0, K * (u1 - u0), K * (v1 - v0));
      }
    }
    if (overlayOn && opt.draw) { c.save(); try { opt.draw(c, T); } catch (e) { console.error(e); } c.restore(); }
  }
  box.addEventListener('wheel', e => {
    e.preventDefault();
    const r = box.getBoundingClientRect(), dd = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-dd * (e.ctrlKey ? 0.01 : 0.002)));   // ctrlKey = trackpad pinch
  }, { passive: false });
  let g0 = 1;   // Safari pinch
  box.addEventListener('gesturestart', e => { e.preventDefault(); g0 = 1; });
  box.addEventListener('gesturechange', e => { e.preventDefault(); const r = box.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.scale / g0); g0 = e.scale; });
  box.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    drag = { x: e.clientX - X, y: e.clientY - Y };
    box.setPointerCapture(e.pointerId);
    box.classList.add('drag');
  });
  box.addEventListener('pointermove', e => { if (!drag) return; X = e.clientX - drag.x; Y = e.clientY - drag.y; moved = true; apply(); });
  const end = () => { drag = null; box.classList.remove('drag'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('dblclick', home);
  box.addEventListener('pointerenter', () => { hovered = api; });
  box.addEventListener('pointerleave', () => { if (hovered === api) hovered = null; });
  new ResizeObserver(() => { if (!ready || !moved) home(); else { K0 = Math.min(bw() / W, bh() / H); apply(); } }).observe(box);
  function onLoad() { msg.hidden = true; if (!ready) home(); else apply(); }
  function onErr() {
    if (++tries > 6) { msg.textContent = 'image failed to load'; return; }
    msg.textContent = `loading… (retry ${tries})`;
    setTimeout(() => { im = image(opt.src, true); bind(); }, 800 * tries);
  }
  function bind() {
    if (im.complete) return im.naturalWidth ? onLoad() : onErr();
    im.addEventListener('load', onLoad, { once: true });
    im.addEventListener('error', onErr, { once: true });
  }
  const api = { box, opt, home, redraw: apply, zoomBy: f => zoomAt(bw() / 2, bh() / 2, f) };
  viewers.add(api);
  const fs = box.closest('figure')?.querySelector('.lk-fs');
  if (fs) fs.onclick = () => openFull(opt);
  bind();
  home();
  return api;
}
function figure(parent, caption) {
  const f = document.createElement('figure');
  f.innerHTML = `<div class="lk-zv"></div><figcaption><span title="${esc(caption)}">${esc(caption)}</span>` +
    '<button class="lk-fs" title="full window (z)">⤢</button></figcaption>';
  parent.appendChild(f);
  return f.querySelector('.lk-zv');
}
function openFull(opt) {
  closeFull();
  const z = $('lk-full');
  z.innerHTML = '<span class="hint">wheel/pinch zoom · drag pan · double-click reset · hold h hides overlay · Esc close</span>' +
    '<button class="lk-close">✕ Esc</button><div class="lk-zv"></div>';
  z.classList.add('on');
  fullApi = viewer(z.querySelector('.lk-zv'), opt);
  z.querySelector('.lk-close').onclick = closeFull;
}
function closeFull() {
  const z = $('lk-full');
  if (!z.classList.contains('on')) return;
  z.classList.remove('on');
  z.innerHTML = '';
  if (fullApi) viewers.delete(fullApi);
  fullApi = null;
}

// vector drawing helpers (screen-space widths; positions in image px through T)
const draw = {
  polys(c, T, polys, { stroke = 'rgba(0,200,0,.95)', fill = 'rgba(0,255,0,.12)', width = 1.2 } = {}) {
    c.lineWidth = width; c.strokeStyle = stroke; c.fillStyle = fill; c.lineJoin = 'round';
    for (const p of polys) {
      if (!p || p.length < 2) continue;
      c.beginPath();
      p.forEach((q, j) => (j ? c.lineTo(T.x(q[0]), T.y(q[1])) : c.moveTo(T.x(q[0]), T.y(q[1]))));
      c.closePath();
      if (fill) c.fill();
      c.stroke();
    }
  },
  segs(c, T, segs, { stroke = 'rgba(0,220,255,.95)', width = 1.5 } = {}) {   // segs: [[x1, y1, x2, y2], ...]
    c.lineWidth = width; c.strokeStyle = stroke; c.beginPath();
    for (const s of segs) { c.moveTo(T.x(s[0]), T.y(s[1])); c.lineTo(T.x(s[2]), T.y(s[3])); }
    c.stroke();
  },
  ringRadius(T, { minR = 6, rImage = 0 } = {}) { return Math.max(minR, rImage * T.k); },
  // point marker: ring (radius max(minR screen px, rImage image px)) + crosshair ticks outside it; returns the radius
  marker(c, T, p, { color = '#ff1e1e', width = 1.6, minR = 6, rImage = 0, ticks = 10 } = {}) {
    const x = T.x(p[0]), y = T.y(p[1]), R = Math.max(minR, rImage * T.k);
    c.strokeStyle = color; c.lineWidth = width; c.beginPath();
    c.moveTo(x + R, y); c.arc(x, y, R, 0, 2 * Math.PI);
    if (ticks) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { c.moveTo(x + dx * (R + 3), y + dy * (R + 3)); c.lineTo(x + dx * (R + 3 + ticks), y + dy * (R + 3 + ticks)); }
    c.stroke();
    return R;
  },
  // a segment that stops gapA / gapB screen px short of its ends (keeps marked pixels visible)
  gapLine(c, T, a, b, { color = '#ff1e1e', width = 1.5, gapA = 0, gapB = 0 } = {}) {
    const ax = T.x(a[0]), ay = T.y(a[1]), bx = T.x(b[0]), by = T.y(b[1]), L = Math.hypot(bx - ax, by - ay);
    if (L <= gapA + gapB + 2) return;
    const ux = (bx - ax) / L, uy = (by - ay) / L;
    c.strokeStyle = color; c.lineWidth = width; c.beginPath();
    c.moveTo(ax + ux * gapA, ay + uy * gapA); c.lineTo(bx - ux * gapB, by - uy * gapB); c.stroke();
  },
  dots(c, T, pts, { color = '#ff9600', r = 4, width = 1 } = {}) {
    c.strokeStyle = color; c.lineWidth = width; c.beginPath();
    for (const p of pts) { const x = T.x(p[0]), y = T.y(p[1]); c.moveTo(x + r, y); c.arc(x, y, r, 0, 2 * Math.PI); }
    c.stroke();
  },
};

// ---------------------------------------------------------------- keys + help
const KEYS = [];
const GESTURES = [['wheel / pinch', 'zoom at the cursor'], ['drag', 'pan'], ['double-click', 'reset that view'],
  ['⤢', 'full window'], ['click a verdict', 'save and move to the next open sample at once']];
function key(keys, label, fn, group = 'Page') { KEYS.push({ keys: [].concat(keys), label, fn, group }); }
const keyName = k => ({ ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Escape: 'Esc', ' ': 'Space' }[k] || k);
function toggleHelp(on) {
  const h = $('lk-help');
  on = on ?? !h.classList.contains('on');
  if (on) {
    const groups = {};
    for (const x of KEYS) (groups[x.group] ||= []).push(x);
    h.innerHTML = '<div class="card"><h2>Shortcuts</h2>' + Object.entries(groups).map(([g, xs]) => `<h3>${esc(g)}</h3><table>` +
      xs.map(x => `<tr><td>${x.keys.map(k => `<kbd>${esc(keyName(k))}</kbd>`).join(' ')}</td><td>${esc(x.label)}</td></tr>`).join('') + '</table>').join('') +
      '<h3>Mouse</h3><table>' + GESTURES.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('') +
      '</table><p class="mut">? or Esc closes</p></div>';
  }
  h.classList.toggle('on', on);
}
// Hold-h hides every overlay while the key is down; any way of losing the key restores it.
function setOverlay(on) { if (overlayOn === on) return; overlayOn = on; viewers.forEach(v => v.redraw()); }
document.addEventListener('keyup', e => { if (e.key.toLowerCase() === 'h') setOverlay(true); });
addEventListener('blur', () => setOverlay(true));
function closeOverlays() { toggleHelp(false); closeFull(); }
document.addEventListener('keydown', e => {
  const t = e.target;
  if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT')) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveNote(); }
    else if (e.key === 'Escape') t.blur();
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return;   // leave browser shortcuts alone
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const hit = KEYS.find(x => x.fn && (x.keys.includes(k) || x.keys.includes(e.key)));
  if (hit) { e.preventDefault(); hit.fn(e); }
});

// ---------------------------------------------------------------- start
function start(c) {
  cfg = { pollMs: 5000, prefetchAhead: 3, ...c };
  document.title = cfg.title || 'Labeling';
  $('lk-title').textContent = cfg.title || 'Labeling';
  $('lk-legend').innerHTML = cfg.legend || '';
  $('lk-verdicts').innerHTML = cfg.verdicts.map(v => `<button data-v="${esc(v.value)}">${esc(v.label)}<kbd>${esc(v.key)}</kbd></button>`).join('');
  document.querySelectorAll('#lk-verdicts button').forEach(b => { b.onclick = () => save(b.dataset.v); });
  for (const v of cfg.verdicts) key(v.key, v.label, () => save(v.value), 'Verdict');
  key('n', 'write a note (⌘↵ in the box saves it alone and moves on; Esc leaves the box)', () => { closeOverlays(); $('lk-note').focus(); }, 'Verdict');
  key('ArrowRight', 'next sample', () => { closeOverlays(); go(idx + 1); }, 'Navigate');
  key('ArrowLeft', 'previous sample', () => { closeOverlays(); go(idx - 1); }, 'Navigate');
  key('u', 'next unlabeled sample', () => { closeOverlays(); nextOpen(); }, 'Navigate');
  key('z', 'full window for the image under the mouse (or the first); again to close', () => {
    if ($('lk-full').classList.contains('on')) return closeFull();
    const v = hovered || [...viewers][0];
    if (v) openFull(v.opt);
  }, 'Images');
  key(['+', '='], 'zoom in (image under the mouse, or the first)', () => (hovered || [...viewers][0])?.zoomBy(1.5), 'Images');
  key(['-', '_'], 'zoom out', () => (hovered || [...viewers][0])?.zoomBy(1 / 1.5), 'Images');
  key('r', 'reset every image view', () => viewers.forEach(v => v.home()), 'Images');
  key('h', 'hold to hide overlays (edges, planes, points); release to show them', e => { if (!e.repeat) setOverlay(false); }, 'Images');
  for (const x of cfg.keys || []) key(x.keys, x.label, x.fn, x.group || 'Page');
  key('m', 'agent message history on/off', () => { showHist = !showHist; chrome(); }, 'Page');
  key('?', 'this help', () => toggleHelp(), 'Page');
  key('Escape', 'close help / full window', closeOverlays, 'Page');
  $('lk-helpB').onclick = () => toggleHelp();
  $('lk-help').onclick = e => { if (e.target.id === 'lk-help') toggleHelp(false); };
  $('lk-prev').onclick = () => go(idx - 1);
  $('lk-next').onclick = () => go(idx + 1);
  $('lk-unl').onclick = nextOpen;
  $('lk-note').addEventListener('input', () => { const o = cur(); if (o) { drafts[o.id] = $('lk-note').value; store.set('drafts', drafts); } });
  addEventListener('beforeunload', e => { if (outbox.length) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('online', () => { poll(); flushSoon(0); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  render();
  pollLoop();
  if (outbox.length) flushSoon(0);   // saves left over from a previous session
}

window.LK = { start, viewer, figure, image, json, draw, esc, key, current: () => cur(),
              state: () => ({ idx, id: cur()?.id ?? null, outbox: outbox.length, online }) };
})();
