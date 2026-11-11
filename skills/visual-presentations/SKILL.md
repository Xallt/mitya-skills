---
name: visual-presentations
description: Visual presentations — use when creating or editing Mitya’s slides, presentation outlines, or Reveal.js decks
---

# Visual presentations

Mitya’s personal presentation workflow. **Edit until only what communicates
remains.** Default to Reveal.js and the bundled visual style, unless Mitya
explicitly chooses another format or direction.

## 1. Agree on the story

Establish the audience, takeaway, and rough slide sequence with its main visuals
before authoring. A supplied outline or brainstorm plus an instruction to
proceed is approval; do not ask again.

Without an outline, ask a compact clarification, propose a short sequence, and
wait for confirmation. Deadline pressure and “get moving” are not approval of an
invented story. Read available context to narrow questions, but do not build a
provisional deck while waiting. **Done: the rough plan is confirmed.**

## 2. Make evidence do the work

Let screenshots, faithful HTML views, charts, and code-rendered explanations
carry the message. Every slide carries a visual, including the title and
objective slides; text alone, however short, is unfinished. A title slide gets an
image that ties it to the topic. Reuse examples when they help continuity.
For product UI, use current components, icons, colors, and assets; do not invent
replacement colors or controls. Redraw small UI elements in HTML for sharp
close-ups. Keep annotations and callouts separate from the captured evidence.

Artistic direction belongs to Mitya. Reuse or curate assets and generate visuals
through code. Do not use image-generation AI, including via CLI, another agent,
or another service. “Make it impressive” does not authorize new artwork.
User-provided artwork may be reused as an existing asset. Each round, offer a
few concrete design ideas, such as a muted full-bleed photo behind a title, and
apply one only after Mitya picks it.

Check what each number counts and its time window. Show both on the slide in a
small muted line, with the unit. Give a domain term a real example image, not
only a definition, and avoid shorthand the audience must decode. Preserve
distinctions such as generated, retained, unchanged, and final. Put provenance
and supporting qualifications in notes; keep any qualification necessary to
interpret the claim visible. Do not turn a trend into a causal savings claim.

Search the data for the example where the effect is plainly visible, not the
median or first candidate. If before and after look alike, it is the wrong
example. Say in notes that it was picked and what is typical.

Under a chart of live data, link its source panel. On a time-based chart, mark
the dated events that plausibly moved that metric, such as releases or changed
instructions: they make the changes interpretable. Look them up even when none
were supplied, leave unrelated events off, and present markers as timing, not
cause.

An HTML product demonstration is not live production. Explain that distinction
in notes and never perform review or submission actions to illustrate a slide.
**Done: each slide has a clear message and a visual with suitable, attributable
evidence.**

## 3. Edit the composition

Use the bundled theme: dark navy, near-white text, cyan emphasis, muted secondary
labels, large type, and generous spacing. Favor one clear composition with
prominent evidence over card grids, gradients, and decorative framing. Approval
of content does not approve an inherited generic design. For new decks, copy
[the starter](templates/starter/index.html); for existing decks, preserve approved
work and change only what is requested.

Minimal means conveying the content without clutter, not less content: keep
details Mitya supplies and find a more efficient form for them. Make the meaning
clear, then cut words, repetition, labels, decoration, and slides that do not
help. Do not trade useful evidence for vague slogans. Move explanation to notes.
Match detail to the audience; not every deck is a nontechnical business
presentation.

No section-header slides. Announce a section with a kicker on its first content
slide.

No trailing periods in titles or one-line slide text. Avoid filler, generic AI
phrasing, and unnecessary technical detail.

Example: replace “AI has transformed the entire review lifecycle, unlocking
scalable operational efficiency” with a screenshot and **“17 / 21 final edges
untouched”** when that is what the evidence supports. Notes can explain the
17 untouched + 2 refined + 2 manual breakdown.

**Done: removing more would make the information less clear or less accurate.**

## 4. Use motion only when it explains

Slides are static by default. Do not add routine bullet entrances or workflow
reveals for polish. Animate to direct attention or demonstrate meaningful
behavior. Keep the same live element through highlighting and zooming; preserve
its state across steps. Give the presenter deliberate control of progression.
A reveal is warranted when the added step is the slide's point, such as a
loop-back arrow that turns a pipeline into a cycle: show the pipeline, then add
that step on a click.

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
