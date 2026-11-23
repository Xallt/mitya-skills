---
name: active-labeling
description: Use when the user wants to label, annotate, or review data themselves — because existing labels are untrusted, a criterion only they can judge, or a rule/model/dataset needs ground truth — for any data type (images, 3D, text, logs, audio, tables).
---

# Active labeling

The user judges; you pick what they judge next. The loop is **live**: the page keeps feeding samples while you analyze labels as they land and append new samples that carry the most signal. The user never waits for you, and never labels a sample that can't change your picture.

## The loop

1. **Agree on the outcomes and the purpose.** Ask one question with a short list of verdicts plus **Note**; expect the list to grow (step 5). If the user's notes show that one verdict bundles several factors, split the question rather than collecting more noisy labels. Write the purpose at the top of the page: what these labels decide (a threshold, a GT set, a sanity check of your method). Never leave the user guessing whether you are testing them or collecting data.
2. **Build the page on the kit** (`kit/` next to this file; see below). Run `kit/page_check.py` against a sandbox copy until it prints ALL PASS. Then look at a few samples yourself and check by eye that each view draws the data correctly — a misaligned overlay poisons every label. Give the user the full URL, with the port, every time you mention the page.
3. **Seed a small batch, ~20.** Selected by the signal rules below, shuffled. Before serving, open several and confirm they are the population you meant ("closeups" really are closeups).
4. **Start the watcher**: a background command that exits after N (≈5–12) labels you haven't read, or when the queue nearly runs dry. Its exit re-invokes you.
5. **On wake, analyze** labels and notes against everything you know (features, existing labels, metadata). Then, in order:
   - post conclusions and any one question to the page's agent strip;
   - turn repeated notes into a new outcome key (e.g. "bad annotation", "can't judge");
   - append the next samples, each group with a written *what this tests*;
   - restart the watcher.
   Done when: every new label and note has been read, the strip states what changed, the queue has open samples or you've said why it doesn't, and the watcher runs.
6. **When samples stop moving the picture**, stop adding them. Ask for notes on specific samples, or build the missing view/feature. More of the same samples is not progress.

## Picking samples: signal for the whole dataset

Each round adds what would most change your understanding of the *whole* dataset — every outcome, not just the target. Draw from:

- **Boundaries** — where your current criterion flips.
- **Gaps** — regions with no labels yet: other sources, sizes, projects, time ranges.
- **Contradictions** — existing labels, features, or notes disagree.
- **Clear exemplars of each outcome** — confirms the criterion holds on every side.

- **Hard cases, not easy ones.** If the user finds a batch easy, it isn't teaching you anything: serve the samples where you or the model are least sure.
- **Spread.** Many scans and projects, few samples per scan. Don't serve the same scans over and over.
- **Never re-ask what is already trusted.** Drop samples that already carry a trusted label (an earlier GT set, the user's own past labels) or that the user has excluded (e.g. a whole scan type).

Write, per group, what each possible answer would tell you. If no answer would change anything, drop the group. Treat older or third-party labels as hints, not ground truth.

## The page: build on the kit

`kit/` is the shared engine; read `kit/README.md`. You write `page.js` (`LK.start({...})`), `items.json` and `queue.json`. The kit supplies the page, the server, saving, polling, prefetching, the image viewer and the `?` shortcut sheet. Don't fork its behaviour in `page.js`; fix the kit and upstream the fix. The user's rules, which the kit enforces and `page_check.py` tests:

- **One screen.** The sample and every control fit the window at laptop sizes; nothing needs page scrolling. Only long text scrolls, inside its own box.
- **Eager.** Every click or key changes the screen at once. Saves queue in an outbox and retry in the background. The next samples are prefetched. Nothing waits on the network, and the next sample appears instantly.
- **Every image zooms and drags.** Wheel or pinch zooms at the cursor, drag pans, double-click resets. Overlays (edges, planes, points) are vectors drawn on the canvas at screen resolution, never baked into the image's pixels. Lines are thin enough to tell neighbours apart when zoomed. Holding `h` hides the overlay on every page; no project rebinds it.
- **Keys for everything, listed under `?`.** Each verdict, note (⌘↵ submits), next/prev, next-unlabeled and every viewer control has a key. The full list sits behind `?`, not in a panel that clutters the screen.
- **Input is sacred.** The note box is big enough to read what you type. Polling never clears it, and an unsent note survives navigation and reloads.
- **Notes are data.** A note can be submitted without a verdict. Read every one.
- **Finishing a sample advances.** The action that finishes a sample saves it and moves to the next open one, with no second keypress for "next". When classifying, that action is any verdict key or click. When editing, it is an explicit Submit button with its own key. A note typed first is saved with it; a note submitted alone also finishes the sample.
- **Hide priors while judging.** Existing labels, model scores, and why you picked the sample show only on samples already answered, when the user steps back to one.
- **Agent strip.** Your latest message, a history toggle and a busy indicator while you analyze. The page jumps to new samples when the current one is done.
- **Judge-grade views.** Show the sample the way the user judges it in their real tool: same viewer controls, every relevant view (e.g. raw + context + overlay), zoomable to the decisive detail. Reuse the product's viewer conventions.

When an overlay gets too dense to read in a static chart or report, serve these samples on a labeling page instead.

## Editing pages (drawing or correcting shapes)

The kit covers classification. For editing, reuse its viewer, outbox and keys, and add:

- **Navigating never edits.** Click-drag pans and the wheel zooms without creating a point. Adding a vertex is an explicit action: a tool mode, or a click on a line.
- **Familiar polygon controls.** Click a line to insert a point, click a point to remove it, drag a point to move it (as in Roboflow and the product's own editor). Snapping to edges is available and can be turned off; don't force it.
- **No destructive shortcuts.** No single key resets to predictions or discards edits. Edits live in local storage, and server state never overwrites them.
- **Layout.** Tools in a left panel, a floating list of the shapes in the current sample, shortcuts behind `?`. No minimap, no per-shape previews. For a new editor, show mockups first (`design-mockups` skill) and iterate before building.
- **Pre-fill for the user's effort.** When the user corrects your proposals, err towards recall: deleting an extra shape is cheaper than drawing a missing one. Check the pre-fill on a few samples first. If the user would have to redraw most shapes, the pre-fill costs them time; fix it before serving.

## Server contract

Disk is the shared state — browser storage is invisible to you.

| File | Writer | Content |
|--|--|--|
| `items.json` | you | sample payloads keyed by stable id |
| `queue.json` | you | ordered ids + why-picked + agent messages; **append-only** |
| `labels.json` | kit server (POST, atomic write) | `{id: {verdict, note, at, client_at}}` keyed by sample id; newest `client_at` wins |
| `.agent_seen.json` | you | which labels you've read |

- **Never reorder or remove queue entries while the page is open** — the page labels by position and saves verdicts onto the wrong sample.
- **The watcher counts labels unseen by you**, not labels since its own last trigger, or it fires early.
- **Servers must outlive your session.** Start each one (page server, any model service) as a systemd user service: `systemd-run --user --unit=<name> --working-directory=<dir> -p Restart=on-failure <python> kit/server.py <project> <port>`. Never `nohup`, `&`, or `setsid` — those stay in the agent's process scope, which is killed on session restart.
- The watcher is `kit/watch.py <project> N`. Background commands time out (~2 h). If the watcher dies idle, tell the user how to resume rather than silently stopping. Don't explain how the server is run unless asked.

## Reporting numbers

Your picked samples are biased on purpose — good for learning, invalid for measuring. Before quoting precision, recall, agreement, or a rate: freeze the thing measured to a file, label a batch sampled at random from the relevant population, and report the interval, not just the point estimate.
