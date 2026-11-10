---
name: active-labeling
description: Use when the user wants to label, annotate, or review data themselves — because existing labels are untrusted, a criterion only they can judge, or a rule/model/dataset needs ground truth — for any data type (images, 3D, text, logs, audio, tables).
---

# Active labeling

The user judges; you pick what they judge next. The loop is **live**: the page keeps feeding samples while you analyze labels as they land and append new samples that carry the most signal. The user never waits for you, and never labels a sample that can't change your picture.

## The loop

1. **Agree on the outcomes.** A short list of verdicts plus **Note**. Expect it to grow (step 5).
2. **Build the page and server** (contract below). Open it once yourself (or render one sample) and check by eye that each view draws the data correctly — a misaligned overlay poisons every label.
3. **Seed a small batch, ~20.** Selected by the signal rules below, shuffled.
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

Write, per group, what each possible answer would tell you. If no answer would change anything, drop the group. Treat older or third-party labels as hints, not ground truth.

## The page

- **Keys for everything.** Each verdict, note (⌘↵ submits), next/prev, next-unlabeled, and every viewer control (zoom-to-sample, full view, reset, switch sub-view). Show the key on each button.
- **Notes are data.** A note can be submitted without a verdict. Read every one.
- **Hide priors until submitted.** Existing labels, model scores, and why you picked the sample stay hidden while judging, then appear after submission.
- **Agent strip.** Your latest message, a history toggle, a busy indicator while you analyze. The page polls the queue every few seconds and jumps to new samples when the current one is done.
- **Judge-grade views.** Show the sample the way the user judges it in their real tool — same viewer controls, every relevant view (e.g. raw + context + overlay), zoomable to the decisive detail. Reuse the product's viewer conventions.

## Server contract

Disk is the shared state — browser storage is invisible to you.

| File | Writer | Content |
|--|--|--|
| `items.json` | you | sample payloads keyed by stable id |
| `queue.json` | you | ordered ids + why-picked + agent messages; **append-only** |
| `labels.json` | page (POST, atomic write) | `{id: {verdict, note, at}}` keyed by sample id |
| `.agent_seen.json` | you | which labels you've read |

- **Never reorder or remove queue entries while the page is open** — the page labels by position and saves verdicts onto the wrong sample.
- **The watcher counts labels unseen by you**, not labels since its own last trigger, or it fires early.
- Background commands time out (~2 h). If the watcher dies idle, tell the user how to resume rather than silently stopping.

## Reporting numbers

Your picked samples are biased on purpose — good for learning, invalid for measuring. Before quoting precision, recall, agreement, or a rate: freeze the thing measured to a file, label a batch sampled at random from the relevant population, and report the interval, not just the point estimate.
