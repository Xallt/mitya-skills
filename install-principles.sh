#!/usr/bin/env bash
#
# install-principles.sh — install PRINCIPLES.md into AI coding harnesses.
#
#   ./install-principles.sh [harness ...]    # default: all
#   ./install-principles.sh claude codex     # only these
#
# Claude gets an idempotent, marker-delimited @import block (re-running
# replaces it in place — never duplicates, never clobbers other content);
# Codex gets a symlink (it has no import syntax).
# Harnesses with no file-based global rules (Cursor) get copied to the
# clipboard with paste instructions.
#
# Override targets for testing:  CLAUDE_MD=/tmp/x CODEX_AGENTS=/tmp/y ./install-principles.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRINCIPLES_FILE="$SCRIPT_DIR/PRINCIPLES.md"

CLAUDE_MD="${CLAUDE_MD:-$HOME/.claude/CLAUDE.md}"
CODEX_AGENTS="${CODEX_AGENTS:-$HOME/.codex/AGENTS.md}"

BEGIN_MARKER='<!-- BEGIN mitya-principles (managed by install-principles.sh) -->'
END_MARKER='<!-- END mitya-principles -->'

# inject_block <target-file> <payload-text>
# Replaces the existing marker block in place, or appends one if absent.
inject_block() {
  local target="$1" payload="$2"
  mkdir -p "$(dirname "$target")"
  touch "$target"

  local blockfile tmp
  blockfile="$(mktemp)"
  tmp="$(mktemp)"
  {
    printf '%s\n' "$BEGIN_MARKER"
    printf '%s\n' "$payload"
    printf '%s\n' "$END_MARKER"
  } >"$blockfile"

  awk -v bmark="$BEGIN_MARKER" -v emark="$END_MARKER" -v blockfile="$blockfile" '
    function emit(   l) { while ((getline l < blockfile) > 0) print l; close(blockfile) }
    $0 == bmark { emit(); skip = 1; done = 1; next }
    $0 == emark { skip = 0; next }
    skip { next }
    { print }
    END { if (!done) { if (NR > 0) print ""; emit() } }
  ' "$target" >"$tmp" && mv "$tmp" "$target"

  rm -f "$blockfile"
}

# --- harness registry -------------------------------------------------------
# Add a harness by writing install_<name>() and listing it in ALL_HARNESSES.

install_claude() {
  # Claude Code supports @import — link, don't copy, so edits to PRINCIPLES.md
  # are picked up live without re-running the installer.
  inject_block "$CLAUDE_MD" "@$PRINCIPLES_FILE"
  echo "  claude  ->  $CLAUDE_MD  (live @import)"
}

install_codex() {
  # Codex has no import syntax — symlink so edits are picked up live.
  # Replaces the whole file: Codex-only global rules would need a snapshot instead.
  mkdir -p "$(dirname "$CODEX_AGENTS")"
  ln -sfn "$PRINCIPLES_FILE" "$CODEX_AGENTS"
  echo "  codex   ->  $CODEX_AGENTS  (live symlink)"
}

install_cursor() {
  # Cursor User Rules live in an app SQLite DB, not a file. Copy + paste.
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy <"$PRINCIPLES_FILE"
    echo "  cursor  ->  contents copied to clipboard"
  else
    echo "  cursor  ->  no clipboard tool; copy $PRINCIPLES_FILE manually"
  fi
  echo "            paste into: Cursor > Settings > Rules > User Rules"
  echo "            (replace any previously pasted block)"
}

ALL_HARNESSES="claude codex cursor"

# --- dispatch ---------------------------------------------------------------
[ -f "$PRINCIPLES_FILE" ] || { echo "error: $PRINCIPLES_FILE not found" >&2; exit 1; }

targets=("$@")
if [ "${#targets[@]}" -eq 0 ] || [ "${targets[0]}" = "all" ]; then
  read -r -a targets <<<"$ALL_HARNESSES"
fi

echo "Installing principles from $PRINCIPLES_FILE"
for t in "${targets[@]}"; do
  if [ "$(type -t "install_$t" || true)" = "function" ]; then
    "install_$t"
  else
    echo "error: unknown harness '$t' (known: $ALL_HARNESSES)" >&2
    exit 1
  fi
done
