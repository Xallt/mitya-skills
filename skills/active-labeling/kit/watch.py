"""Agent watcher (active-labeling skill): exit when enough labels are unseen by the agent, so the exit re-invokes it.

usage: python watch.py PROJECT_DIR [N=6] [MIN_OPEN=3] [TIMEOUT_S=6900]
Exits 0 with "unseen=<n> open=<m>" when >= N labels are not in PROJECT_DIR/.agent_seen.json, or when some are unseen
and fewer than MIN_OPEN samples remain open. Prints "timeout" after TIMEOUT_S (background commands die at ~2 h).
"""
import json
import sys
import time
from pathlib import Path

D = Path(sys.argv[1]).resolve()
N = int(sys.argv[2]) if len(sys.argv) > 2 else 6
MIN_OPEN = int(sys.argv[3]) if len(sys.argv) > 3 else 3
TIMEOUT = float(sys.argv[4]) if len(sys.argv) > 4 else 6900


def rd(n, d):
    try:
        return json.loads((D / n).read_text())
    except Exception:
        return d


t0 = time.time()
while time.time() - t0 < TIMEOUT:
    labels, seen = rd('labels.json', {}), set(rd('.agent_seen.json', []))
    order = rd('queue.json', {'order': []})['order']
    unseen = [k for k in labels if k not in seen]
    open_ = sum(1 for o in order if o['id'] not in labels)
    if len(unseen) >= N or (unseen and open_ < MIN_OPEN):
        print(f'unseen={len(unseen)} open={open_}')
        sys.exit(0)
    time.sleep(10)
print('timeout')
