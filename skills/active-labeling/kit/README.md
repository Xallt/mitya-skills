# labelkit

Shared engine for active-labeling pages. A project writes data files and one `page.js`; the kit provides the page,
the server, the save/poll/prefetch machinery, the image viewer, the shortcut sheet and the page check.

## Principles (the kit enforces them; don't work around them in page.js)

- **One screen.** The sample and every control fit the window; only long text scrolls, inside its own box.
- **Eager.** Every action changes the screen at once. Saves go through an outbox in localStorage that retries until
  the server confirms (newest `client_at` wins on the server). The header pill shows saved / saving / unsaved.
  State polling uses ETag (304 when unchanged); the next samples are prefetched. Nothing waits on the network.
- **Every image is a viewer**: wheel/pinch zoom at the cursor, drag pan, double-click reset, full window, `+`/`-`.
  Overlays are vectors drawn on the canvas at screen resolution, never baked into image pixels; holding `h` hides them (the same in every labeling page).
  A "zoom crop" is the same viewer started on a point (`start: {center, span}`), not a cut-out image.
- **Keys for everything**, all listed under `?` (built from the key registry, so new keys appear there).
- **Input is sacred.** Polling never touches the note box; unsaved notes survive polls, navigation and reloads.
- **Priors hidden while judging.** `reveal` shows only on samples already answered.

## Use

```
<project>/page.js      LK.start({...})            (you)
<project>/items.json   {id: payload}               (you)
<project>/queue.json   {order: [{id, why}], messages: [{at, text}], busy}   (you, append-only)
<project>/labels.json  {id: {verdict, note, at, client_at}}               (server)
<project>/items/<id>/  images, geometry json, ...  (you)

systemd-run --user --unit=<name> -p Restart=on-failure -p MemoryMax=300M python3 <kit>/server.py <project> <port>
python <kit>/watch.py <project> 6        # background: exits when 6 labels are unseen (.agent_seen.json)
python <kit>/page_check.py http://127.0.0.1:<sandbox-port>/ --states 8   # against a sandbox copy; must be ALL PASS
```

`LK.start(config)`:

| field | |
|--|--|
| `title`, `legend` | header text; legend is HTML (`<i style="background:#f00"></i>label`) |
| `verdicts` | `[{value, label, key}]` — buttons + keys; any verdict saves and moves on |
| `question(item, q)`, `meta(item, q)` | HTML above the verdicts (`q` = queue entry) |
| `reveal(item, q)` | HTML shown only once the sample is answered |
| `renderItem(el, item, q)` | fill `el` synchronously: `.col` / `.row` containers, `LK.figure(parent, caption)` → box, then `LK.viewer(box, opt)` (may attach later, e.g. after `LK.json`) |
| `prefetch(item, q)` | warm `LK.json(url)` / `LK.image(src)` for upcoming samples |
| `keys` | extra `[{keys, label, fn, group}]`; they appear under `?` |
| `pollMs`, `prefetchAhead` | defaults 5000, 3 |

`LK.viewer(box, {src, w, h, draw(c, T), start: {center: [u, v], span}, maxZoom})` — `draw` paints in screen space:
`T.x(u)`, `T.y(v)` map image px to screen, `T.k` is the scale. Helpers: `LK.draw.polys / segs / marker / gapLine /
dots / ringRadius`.

Non-image samples (text, tables, 3D) render their own DOM in `renderItem`; the one-screen, eager, keys and input
rules still apply.
