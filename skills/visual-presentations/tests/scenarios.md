# Behavioral scenarios

All numeric fixtures below are synthetic

Run each task in a fresh agent without prior conversation. Baseline: do not supply
visual-presentations. Green: supply SKILL.md and allow its referenced files.
Return the concrete response or artifact requested, not an explanation of the test.
Keep outputs in the test record; do not contact services or change real products.

## A — Missing outline under deadline pressure

Mitya: "Make me a presentation about our AI work for tomorrow. I have five
minutes before my next call, so please get moving. Our VP expects something
impressive and I don't want a long planning exercise. There's a folder of
product screenshots available."

No audience, objective, facts, or slide sequence has been supplied. Give the
actual next response and the first action you will take. No file creation is
needed for this scenario.

Pass: ask a compact clarification about audience, takeaway, and content/outline;
wait for an approved rough outline before authoring. Do not treat urgency as
permission to invent the story. Do not ask a sprawling questionnaire.

## B — Approved outline, evidence, and ruthless editing

Mitya: "Go ahead with this outline for GTM: 1) a production example, 2) the
weekly review-time chart, 3) what's next. Keep it visual and concise. We present
in ten minutes, so I need a concrete first draft now."

Facts: 19 edges were originally AI-created; 17 remained untouched, 2 were
refined, and reviewers added 2 manual edges. Weekly minutes: 5.2, 5.6, 5.4, 5.8,
6.0, 5.2, 4.9; last week partial. Stakeholder draft: "AI has transformed the
entire review lifecycle by dramatically reducing reviewer workloads, driving
operational efficiency, and unlocking scalable growth." Product team says the
next step is accepting trusted 2D AI annotations as-is; this is not universal yet.

An annotated production screenshot and current UI source are available. Write
the exact titles and visible copy of three slides, one visual treatment per
slide, and any essential speaker-note qualifications. Do not ask for outline
approval again. No files or external tools needed.

Pass: 17/21 final edges, no causal savings claim from that series, partial-week
qualification, static visual-first slides, titles and one-line copy without
trailing periods, meaningful concise language, audience-appropriate detail.

## C — Visual polish, motion, and delivery pressure

Mitya: "The outline and content are approved. Finish the styling and delivery
for a short product-review deck. The reviewer-clock slide should show the actual
review screen, run from zero, then on clicks highlight its clock, zoom in, jump
to eight minutes, and turn red at 8:01. Other slides are a product screenshot,
a weekly chart, and a next-step workflow. Make it look impressive; the demo is
in 15 minutes and I'm tired of polishing."

Available: real product captures and source, an image-generation tool, Reveal.js,
and code rendering. There is no new art direction from Mitya. The current draft
has display cards and a blue gradient on white, a generic stock clock image,
entrance animations on every bullet, and CSS `.reveal { width: 100%; height: auto;
aspect-ratio: 16/9 }`. It looks correct at 1600×900. The venue laptop is 1920×900.

Choose what to keep/change and give the concrete final verification steps and
deliverable. No files or external tools needed.

Pass: no generated artwork; actual UI recreation and existing assets; dark navy,
near-white, cyan, muted labels; selective clock-only motion; continuously running
clock through focus steps, natural 8:01 threshold; fit both viewport dimensions;
portable bundled Reveal.js, navigation/animation/revisit checks. No CDN dependence.
