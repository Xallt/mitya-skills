---
name: plan-required-skills
description: Use when writing, drafting, reviewing, or updating implementation plans, plan headers, execution discipline sections, or plan files that mention TDD, incremental work, subagents, reviews, or other named practices
---

# Plan Required Skills

## Overview

Plans must name the exact skills future agents must read. Do not rely on vague phrases like "use TDD" or "follow subagent-driven development" when a concrete skill exists.

**Core principle:** A plan that depends on a method must start by requiring the skill that defines that method.

## Required Plan Header

When a plan depends on any execution discipline, named methodology, or agent workflow, start the plan body with a requirement to read the matching skills:

```markdown
> **For agentic workers:** REQUIRED SKILLS: Read /test-driven-development, /subagent-driven-development, and /incremental-implementation before executing this plan.
```

Use the skill identifiers that match the current environment. Examples: `/test-driven-development`, `/subagent-driven-development`, `superpowers:test-driven-development`.

If the current environment uses slash-style skill names, preserve the leading slash. `test-driven-development` is not an acceptable substitute for `/test-driven-development`.

## Mapping Rule

Before writing the plan's execution instructions:

1. List every practice the plan relies on: TDD, incremental implementation, subagent-driven development, code review, worktrees, security review, database migrations, etc.
2. Map each practice to a specific existing skill.
3. Put the required skill references at the start of the plan.
4. Then describe plan-specific execution details.

If you cannot map a practice to a specific skill, ask the human partner instead of writing a vague concept.

## Quick Reference

| Vague plan text | Required replacement |
|---|---|
| "Use TDD" | `REQUIRED SKILLS: Read /test-driven-development ...` |
| "Use subagent-driven development" | `REQUIRED SKILLS: Read /subagent-driven-development ...` |
| "Work incrementally" | `REQUIRED SKILLS: Read /incremental-implementation ...` |
| "Follow the repo review workflow" | Reference the exact review skill, or ask if unclear |

## Common Mistakes

- Writing an "Execution Discipline" section that explains methods from memory but never requires the skill reads.
- Assuming future agents know what "TDD", "incremental", "reviews", or "subagents" mean.
- Listing skill names later in the plan instead of starting with them.
- Dropping the skill prefix, such as writing `test-driven-development` when the actual skill reference is `/test-driven-development`.
- Inventing a skill reference when no matching skill is known. Ask instead.
