"""Labeling-page check (active-labeling skill). Every check must PASS before the user sees the page.

  fit    at 1280x620 .. 1920x1080, for the first sample and the next K, the page does not scroll and every button,
         text box, image and canvas is fully inside the window
  note   text typed into the note box survives two poll cycles, a next+prev round trip, and a reload
  zoom   the mouse wheel over the largest image zooms it (pixels change, the page does not scroll or zoom), and a drag
         pans it
  help   `?` opens a shortcut sheet; Esc closes it
  eager  with label saves held by a slow network, a verdict key moves the screen on within 300 ms; once the network
         is back the label reaches the server

Run it against a SANDBOX copy of the project (same files, another port): it types a note and saves one label.
usage: python page_check.py URL [--states 4] [--verdict-key 1] [--poll 5] [--shots DIR]
Exit code 0 = all PASS.
"""
import argparse
import glob
import os
import sys
import time

from playwright.sync_api import sync_playwright

VPS = [(1280, 620), (1366, 768), (1440, 800), (1920, 1080)]
FIT = """() => {
 const se=document.scrollingElement, vw=innerWidth, vh=innerHeight, bad=[];
 if (se.scrollHeight>vh+1) bad.push(`page scrolls vertically (${se.scrollHeight}>${vh})`);
 if (se.scrollWidth>vw+1) bad.push(`page scrolls horizontally (${se.scrollWidth}>${vw})`);
 for (const e of document.querySelectorAll('button,textarea,input,select,img,canvas,video')) {
   if (!e.offsetParent || e.closest('[hidden]')) continue;
   const r=e.getBoundingClientRect(), n=(e.id||e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,30);
   if (r.width<2||r.height<2) continue;
   if (r.top<-1||r.left<-1||r.bottom>vh+1||r.right>vw+1) bad.push('off-screen: '+n); }
 return bad; }"""
BIGGEST = """() => { let best=null, a=0;
 for (const e of document.querySelectorAll('img,canvas')) { if (!e.offsetParent) continue;
   const r=e.getBoundingClientRect(); if (r.width*r.height>a) { a=r.width*r.height; best=r; } }
 return best && {x:best.x, y:best.y, width:best.width, height:best.height}; }"""
TEXT = '() => document.body.innerText'


def launch(p):
    try:
        return p.chromium.launch()
    except Exception:
        exes = [x for x in sorted(glob.glob(os.path.expanduser('~/.cache/ms-playwright/*/*-linux64/*')))
                if os.path.basename(x) in ('chrome', 'chrome-headless-shell') and os.access(x, os.X_OK)]
        if not exes:
            raise
        return p.chromium.launch(executable_path=exes[-1])


def settle(pg, ms=900):
    pg.wait_for_timeout(ms)
    pg.wait_for_function("() => [...document.querySelectorAll('img')].every(i => i.complete)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('url')
    ap.add_argument('--states', type=int, default=4, help='also check the next K samples')
    ap.add_argument('--verdict-key', default='1')
    ap.add_argument('--next', default='ArrowRight')
    ap.add_argument('--prev', default='ArrowLeft')
    ap.add_argument('--poll', type=float, default=5, help='page poll interval, seconds')
    ap.add_argument('--shots', help='save a screenshot per window size here')
    a = ap.parse_args()
    base = a.url if a.url.endswith('/') else a.url + '/'
    fails, res = [], {}

    def check(name, cond, msg):
        if not cond:
            fails.append(f'{name}: {msg}')
        res.setdefault(name, True)
        res[name] &= bool(cond)

    with sync_playwright() as p:
        b = launch(p)
        for w, h in VPS:   # fit
            pg = b.new_page(viewport=dict(width=w, height=h))
            pg.goto(base)
            settle(pg)
            for k in range(a.states + 1):
                if k:
                    pg.keyboard.press(a.next)
                    settle(pg, 300)
                bad = pg.evaluate(FIT)
                check('fit', not bad, f'{w}x{h} sample+{k}: ' + '; '.join(bad[:5]))
            if a.shots:
                pg.screenshot(path=os.path.join(a.shots, f'check_{w}x{h}.png'))
            pg.close()

        ctx = b.new_context(viewport=dict(width=1440, height=800))
        pg = ctx.new_page()
        pg.goto(base)
        settle(pg)
        ta = pg.locator('textarea:visible').first   # note
        if not ta.count():
            check('note', False, 'no visible textarea')
        else:
            ta.click()
            pg.keyboard.type('draft note 123')
            pg.wait_for_timeout(int((2 * a.poll + 1.5) * 1000))
            v = ta.input_value()
            check('note', v == 'draft note 123', f'typed text lost after two poll cycles (box now {v!r})')
            pg.keyboard.press('Escape')
            pg.locator('body').click(position=dict(x=2, y=2))
            pg.keyboard.press(a.next)
            pg.wait_for_timeout(300)
            pg.keyboard.press(a.prev)
            pg.wait_for_timeout(300)
            v = pg.locator('textarea:visible').first.input_value()
            check('note', v == 'draft note 123', f'typed text lost after next+prev (box now {v!r})')
            pg.reload()
            settle(pg)
            v = pg.locator('textarea:visible').first.input_value()
            check('note', v == 'draft note 123', f'typed text lost after a reload (box now {v!r})')

        settle(pg, 1500)   # zoom
        r = pg.evaluate(BIGGEST)
        if not r:
            check('zoom', False, 'no visible image')
        else:
            clip = {k: r[k] for k in ('x', 'y', 'width', 'height')}
            cx, cy = r['x'] + r['width'] / 2, r['y'] + r['height'] / 2
            s0 = pg.screenshot(clip=clip)
            pg.mouse.move(cx, cy)
            pg.mouse.wheel(0, -600)
            pg.wait_for_timeout(400)
            s1 = pg.screenshot(clip=clip)
            check('zoom', s1 != s0, 'mouse wheel over the image did not zoom it')
            check('zoom', not pg.evaluate('scrollY') and pg.evaluate('visualViewport.scale') == 1,
                  'wheel scrolled or zoomed the page instead of the image')
            pg.mouse.move(cx, cy)
            pg.mouse.down()
            pg.mouse.move(cx + 80, cy + 50, steps=8)
            pg.mouse.up()
            pg.wait_for_timeout(300)
            check('zoom', pg.screenshot(clip=clip) != s1, 'dragging the zoomed image did not pan it')

        t0 = pg.evaluate(TEXT)   # help
        pg.mouse.move(2, 2)
        pg.keyboard.press('?')
        pg.wait_for_timeout(300)
        t1 = pg.evaluate(TEXT)
        check('help', t1.count('\n') - t0.count('\n') >= 5 and 'Esc' in t1, '`?` did not open a shortcut sheet')
        pg.keyboard.press('Escape')
        pg.wait_for_timeout(300)
        check('help', pg.evaluate(TEXT) == t0, 'Esc did not close the shortcut sheet')

        held = []   # eager
        n0 = len(pg.request.get(base + 'api/state').json().get('labels', {}))
        pg.route('**/api/label', lambda route: held.append(route))
        before = pg.evaluate(TEXT)
        t = time.time()
        pg.keyboard.press(a.verdict_key)
        try:
            pg.wait_for_function('t => document.body.innerText !== t', arg=before, timeout=3000)
            dt = time.time() - t
        except Exception:
            dt = None
        check('eager', dt is not None and dt < 0.3,
              f'screen did not move on within 300 ms while the save was pending ({"no change in 3 s" if dt is None else f"{dt * 1000:.0f} ms"})')
        pg.wait_for_timeout(500)
        try:
            pg.unroute_all(behavior='ignoreErrors')
        except Exception:
            pg.unroute('**/api/label')
        for rt in held:
            try:
                rt.continue_()
            except Exception:
                pass
        landed = False
        for _ in range(60):
            if len(pg.request.get(base + 'api/state').json().get('labels', {})) > n0:
                landed = True
                break
            pg.wait_for_timeout(500)
        check('eager', landed, 'label never reached the server after the network came back (30 s)')
        b.close()

    for name in ('fit', 'note', 'zoom', 'help', 'eager'):
        print(f'{name:<6}', 'PASS' if res.get(name) else 'FAIL')
    for f in fails:
        print('  -', f)
    print('ALL PASS' if not fails else f'{len(fails)} FAILURES')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
