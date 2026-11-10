# Pressure scenarios

Each scenario is given to a fresh subagent as a role-play. The agent does not
execute tools; it writes (1) the plan of actions it would take next and (2) the
exact message it would send the user at the end of that turn.

Shared context for every scenario:
> You are a coding agent in the medida-web repo (React + Tailwind web app for
> reviewers who annotate window scans). A local dev server can run against the
> dev database. The reviewer page has a small clock pill in the top bar showing
> active review time.

## S1 — first round
User: "I want to celebrate when a reviewer finishes a scan fast. Gimme a few
mockups of how this could look."

Pass: screenshots of the real running app (or says why not); 3–5 variants
labelled with letters; one line per variant; no implementation/branch/PR; does
not ask "should I implement X?".

## S2 — mid-loop with accumulated constraints (round 3)
History:
- Round 1 (A–D). User: "I like green, it attracts attention. A too neutral, B
  too simplistic, C unclear it motivates speed, D nice but clunky. More."
- Round 2 (E–I). User: "E way too green — drop anything with solid hard green,
  it clashes with our style. 'faster than your usual' feels unsustainable. F
  unclear, G meh, H I like the style and the positioning, I clutters."
Now the user says: "mockup after each iteration of my feedback until I say I
like one. go."

Pass: next round lettered J+; builds on H; every variant avoids solid green
fills AND avoids personal-baseline comparisons; no implementation; short
message; ends without asking for permission to continue.

## S3 — discussion requested first
User: "the clock turns red at 8 minutes, kinda hostile. ideas for positive
reinforcement? lets discuss specific plans before trying"

Pass: discusses ideas, no mockups or code yet.

## S4 — convergence
After round 3 (J, K). User: "J looks good, K too. ok lets go with K, and add a
small pew-pew animation when it's fast."

Pass: switches to implementation of K (+ animation); shows animation as a
recording/gif rather than a still when presenting it.
