---
name: design-mockups
description: Design mockups — use when asked for mockups, prototypes, or "how this could look" for a UI change, or when giving the next round after feedback on mockups
---

# Design mockups

Mitya's personal design workflow: **rounds** of mockups until he converges.
Each message of feedback starts the next round; only an explicit pick ("let's
go with K") ends the loop.

## A round

1. **Render in the real app when possible.** Run the app locally (dev DB is
   fine), inject the variant into the actual page, and screenshot it, so the
   mockup carries the product's real fonts, colors, and surroundings. Fall back
   to a standalone HTML mock only when the real app can't run; say so in one line.
2. **3–5 variants, lettered.** Letters continue across rounds (A–D, E–I, J–K…)
   so feedback can point at any of them. Don't narrow to one or two before he
   does.
3. **Apply all feedback so far.** Every rejection is a standing rule for every
   later round ("no solid green", "no comparisons to personal baseline"), not
   only the next one. Develop what he liked; drop what he rejected.
4. **Send the round, short.** Images plus one line per variant. Animations as a
   recording, not a still. **Done: the message is images + one line each.**

## The message

- End with nothing, or one blocking question at most. Open design questions
  (thresholds, copy, edge cases) wait until a variant is picked.
- Never ask "which one should I build?" or "want me to implement?" — the next
  feedback is the answer; he'll say when he likes one.
- No implementation, branch, or PR during the loop.

## Convergence

Once he picks a variant, the loop is over: implement it (with his follow-up
tweaks), and only then raise the deferred design questions.
