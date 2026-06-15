# Mitya's Skills

The basic idea: engineer better context and behavior for LLMs with small,
composable skills. They are the skills I was willing to keep after reading, modifying, and
removing some.

## Quickstart

Install with the skills.sh installer:

```bash
npx skills@latest add Xallt/mitya-skills
```

Pick the skills you want and the coding agent you want to install them on.

You can also install one skill directly:

```bash
npx skills@latest add Xallt/mitya-skills --skill grill-me --agent cursor
```

## Read Before Installing

Please read skills before deciding to add!

Some of these are opinionated (especially around PRs / Linear / worktrees), some have repo specifics. 

## Why This Exists

I've been spending a lot of time improving my LLM setup. The thing that helped
most was not a bigger process or a single mega-prompt. It was having small
skills that shape the agent's behavior at the moment they are needed.

The pattern I use now:

- [`grill-me`](./skills/grill-me/SKILL.md) for narrowing down a feature
- For medium to large features, use
  [`incremental-implementation`](./skills/incremental-implementation/SKILL.md),
  [`subagent-driven-development`](./skills/subagent-driven-development/SKILL.md),
  and sometimes
  [`test-driven-development`](./skills/test-driven-development/SKILL.md).
- When code starts getting bloated, use
  [`code-simplification`](./skills/code-simplification/SKILL.md).
- [`pr`](./skills/pr/SKILL.md) for my instructions on creating a PR & linking to a Linear issue
- [`finalize-feature`](./skills/finalize-feature/SKILL.md) any time code in the branch is ready for pushing & needs refinement (run checks / create PR if lacking, check PR comments)
- After a session, use
  [`skill-review`](./skills/skill-review/SKILL.md) to ask what should change in
  the invoked skills so the agent stumbles less next time.

[`find-skills`](./skills/find-skills/SKILL.md) when looking for
better existing skills.

## Reference

Origin notes point to the upstream skill where I could verify one. "Personal"
means I do not know of a direct upstream; it is my own workflow glue or a
repo-specific adaptation.

### Planning And Alignment

- **[`grill-me`](./skills/grill-me/SKILL.md)** - Interview the user relentlessly
  about a plan or design until the important decisions are resolved. Adapted from
  [`mattpocock/skills`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md).
- **[`plan-required-skills`](./skills/plan-required-skills/SKILL.md)** - Keep
  implementation plans honest about TDD, incremental work, subagents, reviews,
  and named execution practices. Personal.

### Building And Debugging

- **[`incremental-implementation`](./skills/incremental-implementation/SKILL.md)** -
  Deliver multi-file changes in small, verified slices. Adapted from
  [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills/blob/main/skills/incremental-implementation/SKILL.md).
- **[`subagent-driven-development`](./skills/subagent-driven-development/SKILL.md)** -
  Execute implementation plans by dispatching isolated subagents for independent
  tasks. Adapted from
  [`obra/superpowers`](https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md).
- **[`test-driven-development`](./skills/test-driven-development/SKILL.md)** -
  Use a red-green-refactor loop when implementing features or bug fixes. Adapted
  from
  [`obra/superpowers`](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md).
- **[`code-simplification`](./skills/code-simplification/SKILL.md)** - Simplify
  working code that has become harder to read, maintain, or extend. Adapted from
  [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills/blob/main/skills/code-simplification/SKILL.md).
- **[`improve-codebase-architecture`](./skills/improve-codebase-architecture/SKILL.md)** -
  Find deeper refactoring opportunities in a codebase. Adapted from
  [`mattpocock/skills`](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md).

### Review And Shipping

- **[`review`](./skills/review/SKILL.md)** - Review branch or work-in-progress
  changes against standards and spec. Adapted from
  [`mattpocock/skills`](https://github.com/mattpocock/skills/blob/main/skills/in-progress/review/SKILL.md).
- **[`finalize-feature`](./skills/finalize-feature/SKILL.md)** - Prepare a
  branch for review: triage existing PR feedback, run checks, commit, push, and
  open or update a PR. Personal.
- **[`pr`](./skills/pr/SKILL.md)** - Create or reconcile a branch, PR, and
  Linear issue so they describe the full branch scope. Personal.
- **[`sep-worktree`](./skills/sep-worktree/SKILL.md)** - Isolate work in a
  separate git worktree and clean it up when the task is done. Personal.
- **[`skill-review`](./skills/skill-review/SKILL.md)** - Retrospect on which
  skills helped or got in the way during a session. Personal.
- **[`handoff`](./skills/handoff/SKILL.md)** - Compact the current conversation
  into a handoff document for another agent. Adapted from
  [`mattpocock/skills`](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md).

### Skill And README Authoring

- **[`writing-skills`](./skills/writing-skills/SKILL.md)** - Create, edit, and
  verify agent skills. Adapted from
  [`obra/superpowers`](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md).
- **[`crafting-effective-readmes`](./skills/crafting-effective-readmes/SKILL.md)** -
  Write or improve READMEs for the right audience and project type. Adapted from
  [`softaworks/agent-toolkit`](https://github.com/softaworks/agent-toolkit/blob/main/skills/crafting-effective-readmes/SKILL.md).
- **[`find-skills`](./skills/find-skills/SKILL.md)** - Discover existing skills
  before writing a new one. Adapted from
  [`vercel-labs/skills`](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md).
