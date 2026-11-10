# Reveal.js delivery

## Start and build

Copy the whole `templates/starter/` directory into the task's artifact directory.
Keep the editable index.html, theme.css, deck.js, vendor files, and local assets.
Replace the starter placeholders; its two slides are scaffolding, not an outline.
The bundled Reveal.js is 5.2.1 under MIT; retain vendor/LICENSE.

The theme is the source of truth for colors, typography, dimensions, and spacing.
It uses a 1600×900 stage fitted within both viewport dimensions. Do not replace
that with width + aspect-ratio alone: a 1920×900 viewport would require scrolling.
Automatic narrow-screen scroll mode is disabled intentionally.

From the skill directory, or using absolute paths:

```sh
python3 scripts/bundle.py /path/to/deck/index.html --out /path/to/deck/presentation.html
```

This embeds local styles, scripts, CSS assets, and ordinary image/media sources.
It rejects remote asset URLs, missing files, asset paths outside the deck folder,
CSS imports, srcset, and iframes. Inline HTML views directly in the slide rather
than embedding production in an iframe. Dynamic JS asset requests must be removed
or embedded explicitly; the bundler cannot discover arbitrary fetch() calls.

For a renderer that needs content-driven height rather than a viewport:

```sh
python3 scripts/bundle.py /path/to/deck/index.html --out /path/to/deck/preview.html --inline-preview
```

This preview mode has its own sizing and root-background rules. Use the actual
preview HTML with the host's preview/render tools when available; do not start a
server just to display an artifact. The portable presentation keeps viewport fit.

## Mechanical checks

From the deck's directory, make Playwright available (`npm install --no-save
playwright`, then `npx playwright install chromium` if needed). Run:

```sh
node /path/to/visual-presentations/scripts/check_deck.mjs presentation.html
```

The checker resolves Playwright from the current directory. CHROME_PATH can point
to an existing Chrome executable. It blocks network requests and checks assets,
notes, heading/one-line punctuation, horizontal/vertical overflow, and keyboard
navigation at several viewport sizes. It saves slide screenshots and report.json
in checks/ next to the presentation. It warns about unmarked short leaf text with
trailing periods; inspect those rather than applying a blind punctuation rewrite.
Mark one-line captions with `data-one-line` for strict checking. Starter markers
`data-placeholder` are errors until replaced.

## Human review

Inspect every slide at consistent scale. Check the intended meaning, readability,
image crop and resolution, collisions, empty space, and source fidelity. Inspect
animations with the motion reference. Do not claim all animation behavior passed
because the generic checker passed.

Deliver a link to the portable HTML and the editable source location. Mention
only limitations or controls that matter to the presenter. Add PDF/PPTX or other
formats only when requested. Do not ship private production assets inside this
skill's reusable template or tests.
