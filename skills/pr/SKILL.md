---
name: pr
description: >-
  Use when the user says /pr, "open a PR", "link this to Linear", or asks to
  name a branch/PR/Linear issue from work in progress — including reconciling an
  existing branch, issue, or PR so all three end up linked. Handles one or many
  branches.
---

# PR

Goal: **end with a branch, a Linear issue, and a PR — all linked.** Reconcile what already exists — don't assume a clean slate.

Three dependencies, in order: **branch → Linear issue → PR**. A PR can only be created once the branch exists and is pushed; Linear linking happens in the PR title, not the branch name.

## Establish state, per branch in scope

1. **Branch** — confirm you're on a feature branch (not `main`). If still on `main` or the branch name is wrong, create/rename per the Branch section below before anything else. Run `git status -sb`: no `...origin/<branch>` → fix per **Push**; `[ahead N]` → push per **Push** before `gh pr create`.
2. **Linear issue** — use the ID/URL the user gave when it still tracks this PR's scope; otherwise create one (see **Medida → Linear**). "On top of ENG-XXXX" is usually a **git** dependency only — not a reason to nest the new issue under ENG-XXXX.
3. **PR** — `gh pr list --head <branch>`. If one exists, make sure it references the issue (fix the title/body if not) and stop there. If none, create it (requires the branch to exist and be pushed).

## Branch

Branch comes first — you can't open a PR without one.

- **Kebab-case only** — lowercase words separated by hyphens, describing the work. An optional lowercase namespace prefix such as `feat/`, `fix/`, or `feature/` is allowed; the slug after the slash must be kebab-case (e.g. `feature/move-agent-guidance-into-repo-skills`).
- **No Linear IDs** — never put `eng-XXXX`, `[ENG-XXXX]`, or any issue reference in the branch name. Linking to Linear happens only in the PR title.
- **Create if missing** — if still on `main` (or another base branch), create a new branch from the current work before proceeding:
  ```bash
  git checkout -b <kebab-description>
  ```
- **Rename if wrong** — if the branch already exists but violates the naming rules, rename it:
  ```bash
  git branch -m <kebab-description>
  ```
  If already pushed, push the new name per **Push**, then delete the old remote branch if needed.

## Push

Every push must leave the local branch tracking `origin/<branch>`

### First push (new branch)

```bash
BRANCH=$(git branch --show-current)
git push -u origin "${BRANCH}"
git branch --set-upstream-to="origin/${BRANCH}" "${BRANCH}"
git status -sb   # must show: ## <branch>...origin/<branch>
```

## Understand scope before naming

Conversation and `git status` usually reflect only the latest edits. **PR titles, PR summaries, and Linear issue titles must describe everything on the branch**, not just the last commit or the current chat turn.

Before naming or renaming a PR or Linear issue (including new sub-issues under a parent):

1. Determine the base branch (`main` unless the user specified otherwise).
2. Read the **full branch delta** against that base:
   - `git log <base>..HEAD --oneline`
   - `git diff <base>...HEAD` (and `git diff <base>...HEAD --stat` for a quick file list)
3. Use that combined picture — all commits and all file changes — to write titles and summaries. Do not rely on only `git log -1`, `git show HEAD`, or unstaged/staged diff alone.

If the branch mixes unrelated work, say so and ask whether to split before opening the PR.

### Keep the PR and issue in sync as scope grows

Once a PR and Linear issue exist, the branch is not frozen. **Any later change to the branch's scope — new commits, moved/added files, expanded behavior — must be reflected in both the PR description and the Linear issue** (and the title, if the scope shift changes what the work is). Don't just push more commits to an open PR and leave a stale description.

After pushing follow-up work, re-read the full branch delta (per above) and:
- Update the PR body via `gh pr edit <num> --body ...` (and `--title` if needed).
- Update the Linear issue via the Linear MCP `save_issue` (`id` = the issue identifier) to match.

## Scope: one branch or many

- **One branch** → one branch name, one issue, one PR.
- **Many branches** → the user gives a Linear ID **per branch**, or a **parent** issue under which you create one sub-issue per branch. Each branch gets its own issue and PR.

## Create / link (general)

- Create with `gh pr create` — **draft by default** unless the user asked for ready-to-review. Short title; minimal body; put the issue reference where Linear will pick it up (title or body).
- If the PR already exists, edit instead of recreating (`gh pr edit`) to add the missing reference.
- Return the PR URL(s); say draft or ready.

## Medida

Repos: `medidai/medida-web`, `medidai/medida-3d`, `medidai/medida-ui`.

### Linear

IDs go in **PR titles** (and the medida-ui commit), never branch names. Title: `[ENG-XXXX] Short description`. medida-web and medida-3d enforce the `[ENG-XXXX]` prefix via CI; medida-ui follows it per `AGENTS.md`.

- **Single repo** — user provides the issue ID/link; use it in the title when it still tracks this PR. When you need a **new** issue (referenced issue already has its own PR, is merged/closed, or scope differs): fetch it with `get_issue`. If it has a `parentId`, create a **sibling** under that parent (`parentId` = the parent's id). If it has no parent, create a **parentless** issue. Never nest the new issue under the referenced issue just because it already has a PR — git stacking is not a Linear parent/child relationship.
- **Multi-repo** — user provides a **parent** issue. Per PR, create an **Engineering** sub-issue (Linear MCP `save_issue`, `parentId` = parent) titled to mirror the PR (from the **branch-wide** diff, per above), and use that sub-issue ID in the title.
- **Created issues** — assign the issue with `assignee: "me"`. Leave priority unset unless the user explicitly specifies one. Set status to `In Progress` by default.

### Stage and commit

Before pushing, commits on the branch should include **only work that belongs in this PR**.

- Review `git status` first. Prefer explicit `git add <path>` over `git add -A` — untracked local files (plans, notebooks, skill drafts) are easy to stage by mistake.
- Do not commit unrelated changes already in the working tree. If the tree mixes unrelated work, say so and ask whether to split before opening the PR.

### Create PR

Requires the branch pushed and tracking upstream (see **Push**). Then `gh pr create`, `--draft` by default:

```bash
gh pr create --draft --base <base> --title "[ENG-XXXX] Short description" --body "$(cat <<'EOF'
...
EOF
)"
```

Keep the title short, like existing merged PRs. Return the URL; note draft vs ready.

### PR body

Fill **only what's needed** — most merged medida PRs leave sections empty. Never paste "Generated with Claude Code".

- **medida-web** — use `.github/PULL_REQUEST_TEMPLATE.md`. Description: 1 sentence (trivial) or 2–3 bullets. Keep the default Testing release-policy link, checklist unchecked, env-overrides empty unless the user specified otherwise.
- **medida-3d** — use `.github/PULL_REQUEST_TEMPLATE.md`. Description: 1 sentence or 2–3 bullets. Related links: Linear URL when useful. Evaluation Results only for pipeline-affecting changes; Edge Cases & Risks only when worth flagging.
- **medida-ui** — no template. Minimal shape below; the commit headline must match the PR title (see finalize-feature).

```markdown
## Summary

- First change
- Second change (if needed)

Linear: [ENG-XXXX](https://linear.app/medida/issue/ENG-XXXX/...)

## Test plan

- [ ] Relevant manual check
- [ ] `scripts/lint.sh` reports no new violations
```

### Stacked PRs

PR B depends on PR A: PR A `--base main`, PR B `--base <branch-of-PR-A>`. Note it in the body (e.g. "Stacks on #2140").

For Linear: PR B still gets its **own** issue. If PR A's issue has a parent, PR B's issue is a **sibling** under that parent; if PR A's issue has no parent, PR B's issue is **parentless**. Do not make PR B's issue a child of PR A's issue.
