---
name: reporting-results
description: Use when writing the final report of a delegated or long-running task: auto-research, an experiment, an evaluation, a data analysis, a migration, or any end-of-run message the owner has to understand and act on. Also when a work-manager briefs an agent that will deliver results.
---

# Reporting results

The owner reads your report cold, often a day later, between other threads. Their bottleneck is understanding and trusting the result, not getting more of it. A report works if they can say what you found, why they should believe it, and what to decide, without asking a single follow-up question.

These are principles, not a template. Apply them to final reports. Mid-run updates stay one-liners: what changed, and whether anything needs the owner.

## Principles

1. **Answer first.** The opening line answers the question the task asked: better, worse or unclear, and compared with what. Then what it means for production, then the decision you need. Never open with method or a table.

2. **Lead with the owner's yes/no.** The top-level split is the one the owner's process acts on (for example "safe for review" vs not), named in the owner's words ("our edge", "inside our plane"). The breakdown of why comes second. A finer technical split at the top hides the answer.

3. **Restate the setup every time, in plain words.** In about three lines, say what was compared, what the ground truth is and where it comes from (and its weak spot), and n. Assume the owner has forgotten all of it. If the ground truth is a proxy (your own labels, injected errors, the pipeline's own output), say so here, not in a caveat at the end.

4. **Explain how it works before saying how well.** Describe the method, rule or guard in a few plain sentences, ideally with one picture. A result for something the reader can't picture is noise.

5. **Back every headline number with cases they can see.** For each claim, show a few concrete examples: successes, failures and borderline cases. Behind every rate ("5% wrong", "catches 85%"), show the cases that make it up. Text-only conclusions are not done.

6. **Make the evidence checkable in the owner's tools and units.** Link each example to where they would verify it themselves: the product's reviewer UI, a 3D viewer, a labeling page. Use the identifiers they see there (for example, the frame number in the carousel), not file names or local paths. Test each link before sending.

7. **Few numbers, each with n.** Keep only the numbers that drive the decision. Give confidence intervals where they change the decision, and leave bracket-dense tables out of the summary. Translate metrics into what the owner cares about: "about 1 extra real edge per photo", not "+1.08 [+0.63, +1.57]" alone.

8. **Plain sentences.** Write one idea per sentence, in words the owner uses. If a sentence needs rereading, replace it with an example. Define every term of art or internal name the first time it appears, or drop it.

9. **Next steps are decisions.** Each one says what you'd do, what it costs, and the yes or no you need. "Consider X" or "belongs with another thread" is not a next step. If nothing needs the owner, say so.

10. **One screen for the message.** The chat message holds the verdict, setup, decisions and a link. Everything else goes in the report artifact. Answer what was asked; don't add procedures nobody requested.

11. **Charts answer one question each.** Use at most three lines per chart, labelled at their ends, with distinct colours and no legend-only keys. If several variants are needed, use small multiples. If a chart still can't be read at a glance, give the owner the examples or a labeling page instead.

12. **Make the report explorable.** Publish it as a Claude artifact (load the `artifact-design` skill first). Make the examples easy to browse: a gallery with filters by outcome or category (pass/fail, error type, score band), click-to-enlarge, side-by-side before/after, and a per-example card with its key numbers and verification link. Video or animation is welcome where motion matters.

13. **Short page.** The artifact is read like the message: in seconds, cold. Open it with an answer box of at most five one-line bullets, numbers in bold, under about 80 words. Below it put one main chart and one example image per category (clicking one filters the gallery). Every other finding gets one line; its chart or table sits behind a show/hide toggle (`<details>`). Decisions are a numbered list, one line each, ending in yes / no. Method notes and caveats go in a collapsed section at the bottom. Paragraphs of sub-splits, intervals and caveats in the main flow make the page unreadable, however correct they are.

14. **PR descriptions follow the same rules.** Say how the change was evaluated (the setup and ground truth), add a few visuals, and briefly list the scripts used.

## Shape that usually works

Adapt it to the task. These are not required sections.

1. **Answer box:** up to five one-line bullets, the owner's yes/no split first.
2. **Setup:** what was compared, the ground truth and its weak spot, n.
3. **How it works:** a few sentences and a picture.
4. **Evidence:** a few examples each of successes, failures and borderline cases, with links. Then the two or three numbers that matter.
5. **Impact on production:** what changes, and how it was measured.
6. **Decisions for the owner:** a numbered list, one line each, with its cost and yes / no.
7. **Details:** further charts and tables behind toggles; method notes and caveats collapsed at the bottom.

## Before sending, check

- Could the owner restate the verdict and the ground truth after reading only the first screen?
- Can the first screen of the page be read in 30 seconds? Is the answer box under about 80 words, with no paragraph in the main flow longer than two sentences?
- Is every number backed by examples they can open and check themselves?
- Does every next step have a yes or no they can answer?
- Did every link open, and does it land on the right example?
