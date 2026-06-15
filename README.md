# Mitya's Agent Skills

[![skills.sh](https://skills.sh/b/Xallt/mitya-skills)](https://skills.sh/Xallt/mitya-skills)

Personal agent skills I use to make coding agents less random and more useful.

The basic idea: engineer better context and behavior for LLMs with small,
composable skills. These are not meant to be a universal workflow framework.
They are the skills I was willing to keep after reading, trying, modifying, and
removing a bunch of others.

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

Please read the skills before adding them.

Some of these are general engineering workflows. Some are very opinionated. A
few include personal or repo-specific habits, especially around PRs, Linear, and
worktrees. They are useful to me because they encode how I actually work, not
because they are perfectly generic.

If a skill is almost right, copy it and edit it. That is the point.

## Why This Exists

I've been spending a lot of time improving my LLM setup. The thing that helped
most was not a bigger process or a single mega-prompt. It was having small
skills that shape the agent's behavior at the moment they are needed.

The pattern I use now:

- For ambiguous plans, use [`grill-me`](./skills/grill-me/SKILL.md) to force
  the missing decisions into the open.
- For medium to large features, use
  [`incremental-implementation`](./skills/incremental-implementation/SKILL.md),
  [`subagent-driven-development`](./skills/subagent-driven-development/SKILL.md),
  and sometimes
  [`test-driven-development`](./skills/test-driven-development/SKILL.md).
- When code starts getting bloated, use
  [`code-simplification`](./skills/code-simplification/SKILL.md).
- When a branch is ready, use
  [`finalize-feature`](./skills/finalize-feature/SKILL.md) and
  [`pr`](./skills/pr/SKILL.md) to push it through checks, PR creation, and issue
  linking.
- After a session, use
  [`skill-review`](./skills/skill-review/SKILL.md) to ask what should change in
  the invoked skills so the agent stumbles less next time.

I also use [`find-skills`](./skills/find-skills/SKILL.md) when looking for
better existing skills instead of writing everything myself.

## Reference

### Planning And Alignment

- **[`grill-me`](./skills/grill-me/SKILL.md)** - Interview the user relentlessly
  about a plan or design until the important decisions are resolved.
- **[`plan-required-skills`](./skills/plan-required-skills/SKILL.md)** - Keep
  implementation plans honest about TDD, incremental work, subagents, reviews,
  and named execution practices.

### Building And Debugging

- **[`incremental-implementation`](./skills/incremental-implementation/SKILL.md)** -
  Deliver multi-file changes in small, verified slices.
- **[`subagent-driven-development`](./skills/subagent-driven-development/SKILL.md)** -
  Execute implementation plans by dispatching isolated subagents for independent
  tasks.
- **[`test-driven-development`](./skills/test-driven-development/SKILL.md)** -
  Use a red-green-refactor loop when implementing features or bug fixes.
- **[`diagnose`](./skills/diagnose/SKILL.md)** - Debug hard bugs and performance
  regressions with a reproduce, minimise, hypothesise, instrument, fix, and
  regression-test loop.
- **[`code-simplification`](./skills/code-simplification/SKILL.md)** - Simplify
  working code that has become harder to read, maintain, or extend.
- **[`improve-codebase-architecture`](./skills/improve-codebase-architecture/SKILL.md)** -
  Find deeper refactoring opportunities in a codebase.

### Review And Shipping

- **[`review`](./skills/review/SKILL.md)** - Review branch or work-in-progress
  changes against standards and spec.
- **[`finalize-feature`](./skills/finalize-feature/SKILL.md)** - Prepare a
  branch for review: triage existing PR feedback, run checks, commit, push, and
  open or update a PR.
- **[`pr`](./skills/pr/SKILL.md)** - Create or reconcile a branch, PR, and
  Linear issue so they describe the full branch scope.
- **[`sep-worktree`](./skills/sep-worktree/SKILL.md)** - Isolate work in a
  separate git worktree and clean it up when the task is done.
- **[`skill-review`](./skills/skill-review/SKILL.md)** - Retrospect on which
  skills helped or got in the way during a session.
- **[`handoff`](./skills/handoff/SKILL.md)** - Compact the current conversation
  into a handoff document for another agent.

### Skill And README Authoring

- **[`writing-skills`](./skills/writing-skills/SKILL.md)** - Create, edit, and
  verify agent skills.
- **[`crafting-effective-readmes`](./skills/crafting-effective-readmes/SKILL.md)** -
  Write or improve READMEs for the right audience and project type.
- **[`find-skills`](./skills/find-skills/SKILL.md)** - Discover existing skills
  before writing a new one.

## Notes

This repository is a snapshot of my global skills. It is public so I can back it
up, install it elsewhere, and share the parts that might be useful.

Suggestions and criticism are welcome.
