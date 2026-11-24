# Behavioral scenarios

All numeric fixtures below are synthetic

Run each task in a fresh agent without prior conversation. Baseline: do not supply
visual-presentations. Green: supply SKILL.md and allow its referenced files.
Return the concrete response or artifact requested, not an explanation of the test.
Keep outputs in the test record; do not contact services or change real products.

## A — Missing outline under deadline pressure

The user: "Make me a presentation about our AI work for tomorrow. I have five
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

The user: "Go ahead with this outline for GTM: 1) a production example, 2) the
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

The user: "The outline and content are approved. Finish the styling and delivery
for a short product-review deck. The reviewer-clock slide should show the actual
review screen, run from zero, then on clicks highlight its clock, zoom in, jump
to eight minutes, and turn red at 8:01. Other slides are a product screenshot,
a weekly chart, and a next-step workflow. Make it look impressive; the demo is
in 15 minutes and I'm tired of polishing."

Available: real product captures and source, an image-generation tool, Reveal.js,
and code rendering. There is no new art direction from the user. The current draft
has display cards and a blue gradient on white, a generic stock clock image,
entrance animations on every bullet, and CSS `.reveal { width: 100%; height: auto;
aspect-ratio: 16/9 }`. It looks correct at 1600×900. The venue laptop is 1920×900.

Choose what to keep/change and give the concrete final verification steps and
deliverable. No files or external tools needed.

Pass: no generated artwork; actual UI recreation and existing assets; dark navy,
near-white, cyan, muted labels; selective clock-only motion; continuously running
clock through focus steps, natural 8:01 threshold; fit both viewport dimensions;
portable bundled Reveal.js, navigation/animation/revisit checks. No CDN dependence.

## D — Approved outline with thin, text-shaped content

The user: "The outline is approved, go ahead. Research team audience, technical.
Keep it minimal. 1) Title: Review automation status 2) Objective: speed up
reviews, proxy metric is the share of scans finished in quick mode 3) Section:
Current status 4) Weekly quick-mode share chart 5) Edge refiner, the new method
6) Section: Frozen assumptions 7) Reviewer labels are a reference, not ground truth"

Facts: weekly quick-mode share, weeks of Sep 28 to Nov 2: 20, 31, 42, 44, 56,
56 percent, from dashboard panel https://dash.example.test/d/review/quick?viewPanel=12.
Changelog: Oct 6 default-to-quick routing; Oct 12 invoice template; Oct 22 scans
opened in full mode sent back to quick; Oct 30 billing export bucket moved. 25% of
8,000 October honeypot reviewer edges failed an on-gradient check; 61% of 300
double-labeled honeypot edges agree within 2 px. The refiner adjusts an edge's
span (extent along the line it covers); mean overlap 0.71 to 0.86. Assets:
review.png, refiner_before.png, refiner_after.png, span_example.png.

Return each shipped slide's title, visible copy, visual, and notes.

Pass: no section-header slides, sections
announced by kickers; numbers show what they count, unit, and window on the slide;
span shown with a real example; the panel link sits under the chart; supplied details kept.

## E — Picking an example and a loop slide

Iterating on an approved deck. The user asks for a refiner example from candidates
(img03: 0.97 to 0.98, typical; img11: 0.88 to 0.93; img07: one 2,043 px edge split
into 645/532/523 px against the reviewer's 651/533/527, 0.83 to 0.99; 155 edges,
mean gain +0.02, 20 split) and a search-loop slide whose point is that the agent
finds flaws in the metric, sending us back to improve it. Return both slides,
presentation behavior, and the final message for the round.

Pass: img07 with notes that it was picked and what is typical; the pipeline shows
first and one click adds the loop-back step.

## F — Weak draft example and a plan slide

Approved slides: weekly review time (6.1, 5.9, 6.2, 5.8, 6.0, 5.7 min); refiner
with an example, draft uses img03 (0.97 to 0.98, before and after look alike);
plans: classify AI-submitted edges into freeze or not, classifier not built.
Available but unread: issue tracker and git tags, eval/results.json with per-edge
overlap and splits, a render script, eval images with reviewer-match labels.

Pass: replaces img03 with an edge whose change is plainly visible, not a median
one; the plan slide states the task on a real example image, not model output.

## H — Sectioned deck with a stepped estimate

The user: "Outline approved, go ahead. Research sync, technical audience. Sections:
Objective (2), Frozen assumptions (2), Open assumptions (1), Current status (3),
Plans (2). In Plans, the key slide is our capacity estimate." Facts: today 30
reviews per reviewer per day (measured, panel link); 50 at 7 active hours
(modeled); competition pace 1.4–1.8× → 70–93; steps 2D freeze −36% → 110–145,
close-ups −13 to −20% → 127–182, reprocessing −3.5 to −6% → 132–193,
auto-approve −4 to −9% → 137–212; target 200.

Pass: a break slide with a small flair before every section after the first; one
value per bar with ranges in notes; measured and modeled steps labeled apart, with
each number's source on the slide; a click-per-step build with the explanation
switching beside the chart.

## I — Narrow request on a deck whose data went stale

The deck was built last week from dashboard data and production examples pulled
last Monday; a release shipped Wednesday. The user asks only for one new
method-comparison slide and a typo fix ("That's it"). Existing tiles compare
methods on eval image 00018; for the new method there is a production screenshot
of a different scan, or a 5-minute run on 00018.

Pass: re-pulls charts and examples and says so; runs the new
method on 00018 rather than using the other scan.

## J — Iteration round with the user's own copy

Approved deck, iterating. The user: "Add a slide before the volunteer ask, titled
'Random things', with these points:
- Context compaction - not scary anymore - I have chats going after ~5 compactions
- T3 - >10 tasks at once is easy-breezy
- Phone booth + speech-to-text for 5 minutes + Opus -> solved
- Slop still gets through -> code still needs review
Also on the skills-repo slide, emphasize the 'Agent memory' line. And on the
MCPs slide, on a step, pop in the new MCPs (PostHog, Linear, Slack, Notion)
next to the old three (Grafana, Supabase, Coralogix)."

Current skills-repo slide: kicker "Skills", title "Same skills and memory on
every machine", a two-item list: "`mitya-skills`: public skills repo" and
"Agent memory: private repo, also installed".

Return the HTML of the new slide, the edited skills-repo slide, and the MCP
step's CSS (timings and easing).

Pass: the four points keep the user's wording; no subtitle, caption, or extra
line the user didn't give; no visual invented for the text slide; "emphasize"
bolds the line in place without restructuring; content is centered when it
doesn't fill the stage; the pops are quick (the group lands within about half a
second), not slow fades.
