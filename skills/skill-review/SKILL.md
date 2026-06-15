---
name: skill-review
description: >-
  Use when the user says /skill-review, asks to review or improve the skills
  used this session, or wants a retrospective on what helped or fell short.
disable-model-invocation: true
---

# Skills Retrospective

Review and improve skills based on conversation experience.

Before proposing changes, read `~/.claude/skills/writing-skills/SKILL.md` for skill
writing best practices — description/CSO rules, structure conventions, token
efficiency, and the test-first discipline. Apply those standards when drafting
suggestions.

## Retrospective Workflow

### Step 1: Identify Skills Used

List all skills loaded or referenced in this conversation:

- Skills attached manually by the user
- Skills auto-loaded during the session (check conversation context)
- Rules or skills mentioned in tool results or system context

For each skill, note its path if known (for example `~/.agents/skills/<name>/SKILL.md`
or project-local `.agents/skills/<name>/SKILL.md`).

### Step 2: Analyze Issues

For each skill, identify:

1. **Command failures** — What commands failed and why
2. **Missing content** — What should have been documented but was not
3. **Incorrect guidance** — What advice was wrong or misleading
4. **Edge cases** — What scenarios were not covered
5. **User confusion** — Where the user got confused or had to correct the agent
6. **Triggering** — Whether the skill fired when it should have, or was missed when relevant

### Step 3: Prioritize Improvements

| Priority | Issue Type | Action |
|----------|------------|--------|
| Critical | Wrong or misleading info | Fix immediately |
| High | Missing critical info | Add to SKILL.md |
| Medium | Edge case not covered | Add to troubleshooting or examples |
| Low | Clarity improvement | Refine wording only if user approves; skip drive-by rewrites |

### Step 4: Document Findings

Produce the report using the single format in **Output Format** below. Per skill, capture: issues + root causes, concrete suggested fixes, and anything still missing.

## Common Issues to Watch For

### Command and Tool Mismatches

- Verify CLI flags against `--help` or docs before documenting them
- Document options that silently fail or behave differently than expected

### Path and Identifier Handling

- Document exact path formats the skill expects
- Note when extensions, prefixes, or IDs must match precisely
- Prefer patterns that extract IDs from authoritative sources (for example JSON list output)

### Natural Language and Parsing

- Document delimiter or naming conventions that parsers handle poorly
- Recommend simple test cases before complex batch operations

### Description and Triggering

- Check whether the description is too narrow (undertrigger) or too broad (overtrigger)
- Align description wording with skill-creator guidance on triggering
- Descriptions should be a **short summary of what the skill covers** — topics/sections it handles and when to use it. Put workflow steps, commands, and long examples in the body or reference files, not in the description.
- Good description: what domains it covers + trigger phrases (e.g. “Supabase migrations, asyncpg queries, SDK row typing”).
- Bad description: procedural detail (“first run X, then Y”), duplicated body content, or meta-instructions (“read environment.md when imports fail”) that belong in SKILL.md.

## Actionable Improvements

When suggesting changes:

1. **Targeted updates only** — propose the smallest change that fixes the issue. Prefer editing one section, adding a short bullet, or extracting a reference file over rewriting the skill. Do not bundle unrelated improvements from the same session.
2. Quote or reference the specific section to change
3. Propose concrete replacement text, not vague advice
4. Separate **must-fix** items from **nice-to-have** polish
5. Do not edit skill files unless the user asks to apply changes

When applying changes the user approves:

- One skill at a time unless they asked for a batch
- Keep diffs minimal — a few lines in an existing section beats a new long section
- If content grows, move detail to a reference file and leave a pointer in SKILL.md

## Output Format

When presenting improvements:

```markdown
## Skills Review

### [skill-name]
| Issue | Root Cause | Suggested Fix |
|-------|------------|---------------|
| ... | ... | ... |

Still missing: [what's needed but not yet addressed], or "nothing".

## Skills With No Issues
- [skill-name] — used appropriately; no changes suggested

## Recommended Next Steps
1. [Highest-priority, most targeted edit]
2. ...
```

Discard low-priority or broad refactors unless the user asks to go further.

## Integration With Previous Sessions

If this continues a prior review:

1. Check whether previous suggestions were implemented
2. Note regressions or new issues
3. Build on prior findings instead of repeating them
