---
name: writing-skills
description: Use when creating, editing, or reviewing a skill (SKILL.md) before deployment
---

# Writing Skills

A skill wrangles **predictability** out of a stochastic agent — the same *process* every run, not the same output. Two questions decide whether a skill earns its place:

1. **Does it work?** You only know if you watched an agent fail *without* it. → Test-Driven Development.
2. **Does it earn its cost?** Every line is paid for on every load. → Compose and prune against that cost.

Writing a skill IS TDD applied to process documentation; editing one is pruning against its cost. This skill covers both lenses.

**Deeper references (load on demand):**
- **/test-driven-development** — the RED-GREEN-REFACTOR cycle this adapts. Understand it first.
- `anthropic-best-practices.md` — Anthropic's official authoring guidance (complementary).
- `persuasion-principles.md` — why anti-rationalization techniques work (Cialdini; Meincke et al.).
- `testing-skills-with-subagents.md` — full pressure-testing methodology and per-type tests.

## The Iron Law

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

Applies to NEW skills AND EDITS. If you didn't watch an agent fail without the skill (or without your edit), you don't know the change teaches the right thing.

**Violating the letter of the rules is violating the spirit of the rules.** No exceptions — not for "simple additions," "just a section," or "doc updates." Wrote it before testing? Delete it; start from a baseline.

## What a skill is

A reusable reference for a proven technique, pattern, or tool — NOT a narrative about solving something once.

**Create when:** the technique wasn't obvious, you'd reuse it across projects, it applies broadly.
**Don't create for:** one-offs; standard practice documented elsewhere; project-specific conventions (→ CLAUDE.md); mechanical constraints enforceable by regex/validation (→ automate). Save skills for judgment calls.

**Frontmatter:** `name` (letters/numbers/hyphens only) and `description` required; ≤1024 chars total; see [agentskills.io/specification](https://agentskills.io/specification).

## Personal skills (mitya-skills)

Mitya's personal workflows live in `~/.agents/mitya-skills/skills/`, with an entry in its README reference. **Before writing or editing one, propose a numbered list of the points you'll add or change, and wait for his confirmation.** His notes are input to that list, not approval of it. After confirmation, run the full cycle below — never skip the baseline.

## Invocation: the two costs

Choosing how a skill is invoked is choosing which cost you pay.

| | Model-invoked | User-invoked (`disable-model-invocation: true`) |
|--|--|--|
| Fires | Agent autonomously; other skills can reach it; you can too | Only you, by name |
| Cost | **Context load** — description sits in every turn | **Cognitive load** — *you* are the index that must remember it |
| Description | Model-facing: leading word + rich triggers | Human-facing: one-line summary, triggers stripped |

Pick model-invocation only when the agent (or another skill) must reach it on its own. If it only ever fires by hand, make it user-invoked and pay zero context load. When user-invoked skills outgrow memory, add a **router skill**: one user-invoked skill that names the others and when to reach each.

## Leading words

A **leading word** is a compact concept already in the model's pretraining that it thinks with while running the skill (*lesson*, *tracer bullets*, *red*). Repeated, it accrues a distributed meaning and anchors a region of behavior in the fewest tokens.

It serves predictability twice: in the body it anchors *execution* (the same behavior whenever the word appears); in the description it anchors *invocation* (shared language across your prompts/docs/code makes the agent link to the skill and fire reliably).

Hunt restatements a leading word retires:
- "fast, deterministic, low-overhead" → a *tight* loop
- "a loop you believe in" → the loop goes *red* (fuzzy gate → binary observable)
- Name skills and files by the leading word: `condition-based-waiting`, not `async-test-helpers`; `root-cause-tracing`, not `debugging`. Gerunds work for processes.

You win twice: fewer tokens, sharper hook. Assume every skill carries restatements — go find them.

## Writing the description

The description does two jobs: say what the skill is, and list the **branches** that trigger it. Every word is context load, so it earns harder pruning than the body.

- **Front-load the leading word** — the description is where it does its invocation work.
- **One trigger per branch.** Synonyms renaming a single branch are duplication; collapse them. Keep only genuinely distinct branches, phrased in the searcher's vocabulary.
- **Never summarize the workflow.** A description that states the process becomes a shortcut the agent follows *instead of* reading the skill (tested: "review between tasks" → agent did one review, though the body's flowchart showed two).
- Cut identity already in the body; keep triggers plus any "when another skill needs…" reach clause.

```yaml
# ❌ summarizes workflow — agent follows this, skips the skill
description: Use when executing plans — dispatch a subagent per task with review between tasks
# ❌ first person / too abstract
description: I help with flaky async tests
# ✅ triggers only, distinct branches
description: Use when executing implementation plans with independent tasks in the current session
```

## Information hierarchy: where content goes

A skill is **steps** and **reference**, mixed freely. Place each rung by how immediately the agent needs it:

1. **In-skill step** — an ordered action in SKILL.md. Each ends on a **completion criterion**: *checkable* (can the agent tell done from not-done?) and, where it matters, *exhaustive* ("every modified model accounted for," not "make a list"). A vague criterion invites premature completion.
2. **In-skill reference** — a definition/rule/fact in SKILL.md, consulted on demand. A flat peer-set (every rule on one rung) is fine, not a smell.
3. **External reference** — pushed to a linked file via a **context pointer**, loaded only when the pointer fires.

Inline what every branch needs; push behind a pointer what only some branches reach — that's **progressive disclosure**, and branching is its cleanest test. The pointer's *wording* (not its target) decides how reliably the agent follows it. **Co-locate** a concept's definition, rules, and caveats under one heading so reading one part brings its neighbors. Push too little down and the top bloats; push too much and you hide what's needed — that tension is the whole decision.

**Separate files for:** heavy reference (100+ lines), reusable tools/scripts/templates. **Keep inline:** principles, short patterns (<50 lines).

**Cross-referencing other skills:** name the skill with an explicit marker (`**REQUIRED SUB-SKILL:** Use /test-driven-development`). Never use `@file` links — they force-load immediately and burn context before you need it.

## The cycle: RED → GREEN → REFACTOR

### RED — baseline (watch it fail)
Run a pressure scenario with a subagent **without** the skill. Document verbatim: what they chose, which rationalizations they used, which pressures triggered the violation. You can't write the right skill until you've seen the natural failure.

### GREEN — write minimal
Write the skill addressing *those specific* failures — no content for hypothetical cases. Compose with the hierarchy and leading words above. Re-run the scenario with the skill; the agent should now comply.

### REFACTOR — close loopholes, then prune
New rationalization appears? Add an explicit counter; re-test until bulletproof. Then prune (below). Re-test after pruning — cuts can break compliance.

Different skill types need different tests (discipline / technique / pattern / reference) — see `testing-skills-with-subagents.md` for those and the pressure types (time, sunk cost, authority, exhaustion).

## Pruning

- **Single source of truth** — each meaning in one authoritative place, so changing behavior is a one-place edit.
- **Relevance** — does each line still bear on what the skill does?
- **No-ops** — hunt sentence by sentence: does this sentence change behavior versus the agent's default? If not, delete the *whole sentence* (don't trim words). Be aggressive; most failing prose should go, not be rewritten. A weak leading word (*be thorough* when the agent already is) is a no-op — fix with a stronger word (*relentless*), not more technique.

## When to split

Each cut spends one of the two costs, so split only when it earns it:
- **By invocation** — split off a model-invoked skill when a distinct leading word should trigger it independently, or another skill must reach it. You pay context load for the new always-loaded description, so that independent reach must be worth it.
- **By sequence** — split a run of steps when the steps ahead tempt the agent to rush the one in front (premature completion). Hiding them encourages legwork on the current task.

Same trigger, same leading word → one skill, not two.

## Failure modes (diagnose a misbehaving skill)

| Mode | What it is | Cure |
|--|--|--|
| **Premature completion** | Step ended before genuinely done; attention slips to *being done* | Sharpen the completion criterion first; only if irreducibly fuzzy *and* you see the rush, split by sequence |
| **Duplication** | Same meaning in 2+ places | Collapse to a single source; a leading word often retires the restatement |
| **Sediment** | Stale layers that accrued because adding feels safe, removing feels risky | A pruning discipline; check relevance regularly |
| **Sprawl** | Too long even when every line is live | Disclose reference behind pointers; split by branch/sequence |
| **No-op** | A line the model already obeys by default | Delete, or replace a weak leading word with a stronger one |

## Bulletproofing discipline skills

Skills enforcing discipline (TDD, verification-before-completion) must resist rationalization under pressure. Don't just state the rule — forbid the workarounds.

- **Close every loophole explicitly:** "Delete it. Start over. Don't keep it as reference. Don't adapt it. Don't look at it. Delete means delete."
- **Rationalization table** — capture every excuse from baseline testing:

| Excuse | Reality |
|--|--|
| "Too simple to test" | Simple code breaks. Test takes 30s. |
| "I'll test after" | Tests passing immediately prove nothing. |
| "It's spirit not ritual" | Letter and spirit are the same here. |

- **Red flags list** — make self-checking easy: "code before test," "already manually tested," "this is different because…" → all mean *stop, start over*.
- Put violation symptoms into the description's triggers (see `persuasion-principles.md` for why authority/commitment framing works).

## Anti-patterns

- **Narrative** ("In session 2025-10-03 we found…") — not reusable.
- **Multi-language dilution** (example.js + .py + .go) — one excellent example beats many mediocre; you can port.
- **Code in flowcharts** / **generic labels** (step1, helper2) — labels must carry meaning.
- Flowcharts only for non-obvious decisions or premature-stop loops — never for reference (tables), linear steps (numbered lists), or code (markdown blocks). See `graphviz-conventions.dot`; render with `render-graphs.js`.

## Checklist (one TodoWrite item each)

- **RED:** pressure scenario(s) written · ran without skill · baseline + rationalizations documented.
- **GREEN:** name/leading word sharp · description = distinct triggers, no workflow summary · content placed on the hierarchy · addresses the baseline failures · one strong example · re-ran with skill, complies.
- **REFACTOR:** loopholes countered · single source of truth · no-op pass done (sentence by sentence) · within budget (no sprawl) · re-tested green.

## STOP before the next skill

After writing ANY skill, finish its test loop before starting another. Untested skill = untested code. No batching.
