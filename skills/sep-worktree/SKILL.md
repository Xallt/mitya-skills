---
name: sep-worktree
description: >-
  Use when the user wants to isolate work in a separate git worktree, says
  /sep-worktree, chooses worktree over in-place (e.g. from /think), or says
  worktree done.
disable-model-invocation: true
---

# Separate worktree

Keep the main checkout clean. All paths below are relative to the **repo root** (the directory that owns `.git`).

## Create

Pick a short directory name (`$path`, e.g. `fix-overlay-mask`) and a branch name (`$BRANCH_NAME`). Confirm with the user if either is unclear.

```bash
git worktree add ".worktrees/$path" -b "$BRANCH_NAME" --no-track origin/main
```

Default base is `origin/main`. If the work stacks on another branch/PR, substitute that ref:

```bash
git worktree add ".worktrees/$path" -b "$BRANCH_NAME" --no-track origin/<base-branch>
```

**VERY IMPORTANT:** use `--no-track`. Without it, the new branch tracks the base ref you passed (often `origin/main`).

Then **work in** `.worktrees/$path` for all edits, commits, and commands for this task.

### medida-3d (and similar monorepos)

Before scripts/tests in the worktree:

```bash
set -a && source ../../.env && set +a   # fish: loadenv ../../.env
```

For a worktree-local `.venv`:

```bash
TMP_BUILD_PATH=../../tmp ./setup.sh
```

(run from the worktree root; reuses cached deps from the outer repo)

After `setup.sh` or `uv sync`, the worktree has a large `.venv` at its root — scope `rg`/`grep` to source dirs (e.g. `medida_3d/`, `backend/`, `evaluation/`) and avoid repo-wide `rg --no-ignore-vcs`, or searches can hang.

## Teardown

Remove the worktree when work on the task is finished — **do not wait for explicit approval** unless context still requires the checkout locally.

Also remove when the user says **worktree done** or clearly wants it gone.

### Skip auto-removal only when context needs the checkout

Keep the worktree if any of these apply:

- The user was asked to verify, test, or review something **locally** in that tree (and that step is not done).
- The user said they will continue in the worktree, merge manually, or keep it for later.
- The tree is dirty with uncommitted work you did not resolve — report and ask whether to commit, stash, or force-remove (do not silently delete).

If none of those apply (task done, PR opened, fix shipped, user moved on, etc.), tear down without asking.

### Commands

From the **main** repo root (not inside the worktree):

```bash
git worktree remove ".worktrees/$path"
git worktree prune
```

Do **not** delete the branch unless the user asks. If `worktree remove` fails because of uncommitted changes, report it and ask whether to force-remove or commit/stash first.

## While active

- Treat `.worktrees/$path` as the only workspace for this task until teardown.
- PRs, commits, and validation run from the worktree checkout.
- Say **worktree done** anytime to remove it early (see Teardown).
