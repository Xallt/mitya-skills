# Verification record

Model: inherited parent model, fresh agents without conversation history.
Baseline prompts: scenarios A–C without this skill. Numeric fixtures were
subsequently replaced with synthetic values for distribution; no behavior rules
changed. Initial source figures are omitted from this record.

## RED — observed before SKILL.md existed

### A: failed outline gate

Verbatim decision:

> I’ll build a short internal VP briefing with a provisional six-slide story: the customer problem, AI’s role, a product walkthrough, evidence of progress, current limitations, and the next milestone. I’ll use the screenshots prominently and mark any missing facts for confirmation.

> Before your call, send just one sentence: what should the VP decide or remember after this presentation?

The clarification was compact, but the agent inferred both the audience and story
and committed to building before confirmation. Pressure: deadline, executive
expectations, and avoiding a planning exercise. No explicit rationalization beyond
the provisional-story framing was given.

### B: failed product fidelity and punctuation

Verbatim visual choice:

> Color-code edges with a compact legend: green = AI kept, amber = AI refined, blue = manually added.

Verbatim visible copy:

> AI supplied the starting geometry; reviewers made targeted changes.

> Accept trusted annotations as-is.

> Review and refine where needed.

The agent invented product colors and used trailing periods. It correctly distinguished the original AI-created set from the final edge
count. That is valid arithmetic and is not counted as a failure. It also
correctly avoided causal savings claims and flagged the partial week. Pressure:
short deadline, inflated stakeholder copy, and concise GTM storytelling.

### C: failed personal style, unnecessary additions

Verbatim decision:

> I’ll keep the approved content, blue-on-white palette, and card styling.

> using the existing palette and a single restrained reveal if it helps the explanation.

> a static PDF backup showing the clock’s key states.

Only content and outline had been approved, not the inherited styling. The agent
kept the wrong default theme, allowed an unneeded workflow reveal, and added an
unrequested deliverable. It correctly rejected generated imagery, kept most
slides static, preserved clock continuity, and proposed offline/viewport checks.
Pressure: demo deadline, user fatigue, and polishing an existing draft.

## Scope

These scenarios sample behavior; passing them is not a claim of universal
compliance. Content rules also reflect the owner's explicitly confirmed points.
No production images, identifiers, or measurements are packaged with the skill;
distributed numeric scenarios use synthetic fixtures.

## GREEN — first skill version

All three fresh agents were supplied SKILL.md but not the tests or baseline.

A passed the outline gate:

> I’m waiting before authoring

It asked for audience/takeaway and proposed a five-slide outline for confirmation.
It still inspected local context, which the skill permits; no deck was authored.

B preserved evidence and punctuation:

> Preserve the existing product colors and annotations; keep slide callouts outside the screenshot.

It supplied three static slides, explicitly marked the partial week, avoided a
causal savings claim, and removed the inflated stakeholder statement. Titles and
one-line slide copy had no trailing periods. It did not request approval again.

C adopted the personal theme and bounded motion:

> I’ll remove the display cards, blue gradient, generic stock clock, and routine bullet entrances.

> Click: zoom that same element, fading surrounding UI without resetting time

It rejected image generation, kept an offline editable+portable HTML deliverable,
used both viewport dimensions, and proposed threshold/back/revisit/rapid-click/
reduced-motion checks. It did not add a PDF backup.

## REFACTOR — prune and retest

Pruned duplicated phrasing and retained the outline, fidelity, art-direction,
editorial, motion, and delivery rules. A fresh three-situation retest passed A
and C. B exposed an unfinished chart draft:

> W1–W8 values 5.2, 5.6, 5.4, 5.8, 6.0, 5.2, 4.9, 4.9? **Correction:** The supplied series contains seven values

Added a short final-edit requirement: reconcile chart point counts and units with
the source and remove drafting calculations/self-corrections. A new independent
B run then produced:

> Weekly review time

> Average minutes per review

> Latest week incomplete

It specified exactly seven points, preserved the partial-week qualification,
kept final counts coherent, separated synthetic fixtures from screenshot evidence,
and omitted the stakeholder's unsupported transformation claim. No new approval
round or generated art was introduced.

## Mechanical verification

- Six bundler tests: local HTML/CSS/script assets, inline CSS, quoted paths with
  spaces, style attributes, missing/remote paths, directory escape, source safety
- Starter check flags unreplaced placeholders
- Browser regression covers offline loading, keyboard navigation, speaker notes,
  both slide layouts at four viewport sizes, and content-height inline preview
- Deliberately broken punctuation, image source, and aspect-ratio-only sizing
  must fail the browser checker
- JavaScript syntax and all local Markdown reference targets checked

Run `python3 -m unittest discover -s tests` from the skill directory. For browser
regression, run `node /path/to/visual-presentations/tests/test_starter.mjs` from a
directory with Playwright installed; optionally set CHROME_PATH to local Chrome.
