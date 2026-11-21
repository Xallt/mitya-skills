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

# My approach

The pattern I use now:

- [`grill-me`](./skills/grill-me/SKILL.md) for narrowing down a feature
- [`test-driven-development`](./skills/test-driven-development/SKILL.md) when I ask for TDD
- [`pr`](./skills/pr/SKILL.md) for my instructions on creating a PR & linking to a Linear issue
- [`finalize-feature`](./skills/finalize-feature/SKILL.md) any time code in the branch is ready for pushing & needs refinement (run checks / create PR if lacking, check PR comments)

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

### Building And Debugging

- **[`test-driven-development`](./skills/test-driven-development/SKILL.md)** -
  Use a red-green-refactor loop when implementing features or bug fixes. Adapted
  from
  [`obra/superpowers`](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md).
- **[`vercel-react-best-practices`](./skills/vercel-react-best-practices/SKILL.md)** -
  Apply Vercel Engineering's React and Next.js performance guidance.

### Review And Shipping

- **[`finalize-feature`](./skills/finalize-feature/SKILL.md)** - Prepare a
  branch for review: triage existing PR feedback, run checks, commit, push, and
  open or update a PR. Personal.
- **[`finalize-in-sep-worktree`](./skills/finalize-in-sep-worktree/SKILL.md)** -
  Run feature finalization in a separate worktree and clean it up afterward. Personal.
- **[`pr`](./skills/pr/SKILL.md)** - Create or reconcile a branch, PR, and
  Linear issue so they describe the full branch scope. Personal.
- **[`splitting-prs`](./skills/splitting-prs/SKILL.md)** - Split one oversized
  branch into multiple reviewable, correctly linked PRs, optionally as a stacked
  chain under a parent Linear issue. Personal.
- **[`sep-worktree`](./skills/sep-worktree/SKILL.md)** - Isolate work in a
  separate git worktree and clean it up when the task is done. Personal.
- **[`handoff`](./skills/handoff/SKILL.md)** - Compact the current conversation
  into a handoff document for another agent. Adapted from
  [`mattpocock/skills`](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md).

### Task And Session Management

- **[`life-manager`](./skills/life-manager/SKILL.md)** - Review personal tasks,
  plan errands, and schedule them around existing commitments. Personal.
- **[`session-manager`](./skills/session-manager/SKILL.md)** - Delegate work to
  agent sessions, track progress, and surface decisions. Personal.
- **[`telegram-notify`](./skills/telegram-notify/SKILL.md)** - Send requested
  notifications through the configured Telegram bot. Personal.

### Presentations

- **[`visual-presentations`](./skills/visual-presentations/SKILL.md)** - Create and
  edit Mitya’s visual presentations, with a Reveal.js starter and offline delivery
  checks. Personal.

### Design

- **[`design-mockups`](./skills/design-mockups/SKILL.md)** - Iterate rounds of
  lettered mockups, rendered in the real app, until Mitya picks one. Personal.

### Data

- **[`active-labeling`](./skills/active-labeling/SKILL.md)** - Live labeling
  loop: the agent watches labels land, picks the next most informative samples,
  and talks back on the page. Personal.

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
