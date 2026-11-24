#!/bin/sh
# Rebuild presentation.html from index.html. Set OUT to the deck's portable file name.
set -e
cd "$(dirname "$0")"
OUT=presentation.html
python3 "$HOME/.agents/mitya-skills/skills/visual-presentations/scripts/bundle.py" index.html --out "$OUT"
echo "built $(pwd)/$OUT"
