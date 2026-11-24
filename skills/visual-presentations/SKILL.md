---
name: visual-presentations
description: Visual presentations — use when creating or editing the user’s slides, presentation outlines, or Reveal.js decks
---

# Visual presentations

The user’s personal presentation workflow. **Edit until only what communicates
remains.** Default to Reveal.js and the bundled visual style, unless the user
explicitly chooses another format or direction.

## 1. Agree on the story

Establish the audience, takeaway, and rough slide sequence with its main visuals
before authoring. A supplied outline or brainstorm plus an instruction to
proceed is approval; do not ask again.

Without an outline, ask a compact clarification, propose a short sequence, and
wait for confirmation. Deadline pressure and urging to start are not approval of an
invented story. Read available context to narrow questions, but do not build a
provisional deck while waiting. **Done: the rough plan is confirmed.**

## 2. Make evidence do the work

Let screenshots, faithful HTML views, charts, and code-rendered explanations
carry the message where they say it better than words; when text is enough, a
text slide is fine. Show evidence sharp at presentation size; if a source is
blurry, get a better one rather than shipping it. Mark unreleased work with a
one-word status tag rather than a sentence. Reuse examples when they help
continuity.

Every visual must match the claim and context of its slide. When available
evidence shows a different state than the slide describes, find better evidence
or redraw it faithfully from real data in product styling, and say so in notes.
Give each element the form of its meaning: draw a button only for an action,
an arrow for a hand-off or routing, and a small visual rather than a sentence
for a quantity or a decision. Next to an abstract measure, list on the slide what
it covers, so the audience sees what it could fall short on.
For product UI, use current components, icons, colors, and assets; do not invent
replacement colors or controls. Redraw small UI elements in HTML for sharp
close-ups. Keep annotations and callouts separate from the captured evidence.

Artistic direction belongs to the user. Reuse or curate assets and generate
visuals through code. Do not use image-generation AI, including via CLI, another
agent, or another service. A request for more impressive slides does not
authorize new artwork. User-provided artwork may be reused as an existing asset.
A sketch from the user conveys structure, not styling: keep its layout, take the
look from the theme.

Check what each number counts and its time window. On slides that show measured
numbers, the source line is only “Data from” and the date range; omit it on
slides without measured data. Definitions, queries, provenance, and caveats go in
notes, never in a long footer string. Keep visible only a qualification without
which the claim would mislead. Show the counts behind a percentage and its
window next to it. Give a domain term a real example image, not only a
definition, and avoid shorthand the audience must decode. Preserve distinctions
between states of the data. Do not turn a trend into a causal savings claim.

Search the data for the example where the effect is plainly visible, not the
median or first candidate. If before and after look alike, it is the wrong
example. Say in notes that it was picked and what is typical.

On an estimate chart, show one value per bar, the average, and keep ranges in
notes. Keep measured and modeled values as separate, labeled steps, and make it
clear on the slide where each number comes from.

Data goes stale between rounds. Default to the last two weeks ending today. At
the start of each round, re-pull data-driven charts and examples from the latest
data and mark new releases, even when the request is narrow. Keep the pulls and chart code in the deck's scripts/ and
data/ folders so a refresh is a rerun.

Draw charts as transparent SVG in the chart ink hexes listed in
[delivery.md](references/delivery.md); the deck recolors them for the active
palette. Under a chart of live data, link its source panel.

An HTML product demonstration is not live production. Explain that distinction
in notes and never perform review or submission actions to illustrate a slide.
**Done: each slide has a clear message, and every visual is suitable,
attributable evidence.**

## 3. Edit the composition

Use the bundled theme. One design ships in two palettes, switched in the Esc
menu: graphite dark (cyan data, amber numbers) and warm light paper (cobalt).
It uses heavy Schibsted Grotesk headings, IBM Plex Mono for small labels, and a faint
dot field. Its components are an underlined mono `.kicker` above each title,
`.fig` crop marks around evidence, outlined `.card` surfaces on a tinted offset
shadow, and `.list` items numbered "1.". Color only through the `--deck-*`
tokens, never fixed hex, so both palettes work. Favor one clear composition
with prominent evidence over card grids, gradients, and decorative framing. Approval
of content does not approve an inherited generic design. For new decks, copy
[the starter](templates/starter/index.html); for existing decks, preserve approved
work and change only what is requested.

Start minimal and let the user ask for more: an unrequested addition costs a cut
later. Minimal means without clutter, not less of the user's content: keep what
the user supplies and find an efficient form for it. The user's words are
content; keep them as given and reword only when asked. Text you write yourself,
titles included, is the fewest words that name the thing, not a full-sentence
claim. An edit is scoped to what it names and leaves the rest of the slide as it
was. Do not trade useful evidence for vague slogans. Match detail to the
audience; not every deck is a nontechnical business presentation.

Keep on-slide text to what viewers can read at a glance; the user explains the
deeper meaning aloud, so explanation goes in notes. State a key point as a
headline number or phrase. Keep captions short, set multi-part captions as a
list, and cut any caption that repeats the image or the title. Write product
names, features, and statuses exactly as the product does, name steps precisely,
and emphasize these terms and the key phrase in the accent color.

Use section-break slides only when a deck has several sections of several slides
each. A break shows a fitting emoji on the theme's tilted icon card, the section
name, and a "Section N" kicker, or a muted background graphic, on the plain slide
background. The first section starts right after the title.

Balance content on the stage: when it does not fill the slide, center it rather
than leaving it hanging at the top.

No trailing periods in titles or one-line slide text. Avoid filler, generic AI
phrasing, and unnecessary technical detail.

**Done: removing more would make the information less clear or less accurate.**

## 4. Use motion only when it explains

Slides are static by default. Do not add routine bullet entrances or workflow
reveals for polish. Animate to direct attention or demonstrate meaningful
behavior. Keep the same live element through highlighting and zooming; preserve
its state across steps. Give the presenter deliberate control of progression.
A reveal is warranted when the added step is the slide's point. For a result
built in steps, one click per step with its explanation beside the chart is
welcome.

When motion is needed, read [motion.md](references/motion.md). Otherwise omit it.
**Done: every animation has a specific communication purpose.**

## 5. Verify and deliver

Follow [delivery.md](references/delivery.md) to build the portable HTML and check
viewport fit, assets, punctuation, navigation, notes, and any animation. Inspect
every slide visually; passing checks does not establish editorial quality.
Reconcile chart point counts and units with the source, and remove drafting
calculations or self-corrections from the final copy.

Deliver the editable source and portable HTML path. Do not add unrequested
formats or a recap of every routine check. **Done: the presentation is reviewable,
readable without scrolling, and works without a network connection.**
