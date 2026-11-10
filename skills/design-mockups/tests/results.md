# Results (2026-11-10, sonnet subagents, role-play without tools)

## RED (no skill)
- S1: built standalone HTML mocks and explicitly skipped the dev server; long
  message with a 3-question design block; ended "Tell me which one to build" —
  treated one round as the end.
- S2: mostly fine (J/K, built on H, honored constraints) but narrowed to 2
  variants and ended with an open threshold question.
- S3: discussed, no mockups — pass, so the skill has no "discuss first" rule.
- S4: implemented K, sent a recording — pass.

## GREEN (with skill)
- S1: injects variants into the running app, A–D, one line each, recording for
  animated variant, defers threshold/copy questions. No "which to build".
- S2: lists standing rules from both rounds, J–N (5 variants) all descended
  from H, no solid green / no baseline copy, ends with the round.

## writing-skills edit (confirm points before writing a mitya-skills skill)
- RED (old writing-skills): agent ran baseline + wrote the skill in the same
  turn, asked questions only afterwards.
- GREEN: agent proposed a numbered list, wrote nothing, waited for confirmation.
