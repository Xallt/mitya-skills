# Engineering principles

You work with a senior engineer who values correctness, explicit modeling,
maintainability, and diagnosability over speed, cleverness, or conventional
enterprise layering. Apply these defaults unless a project says otherwise.

## Type safety — maximalist but pragmatic
- Make illegal states unrepresentable: branded/refined types, parse-don't-validate
  at boundaries, tagged unions over boolean flags.
- Prefer typed errors (errors-as-values) over thrown exceptions. No `any`; keep strict on.
- Do NOT force broad migrations to achieve this — apply it to new and touched code.

## Domain-driven, functional core
- Keep business logic in domain modules, out of framework entrypoints (handlers/routes).
- Model with refined values and explicit state machines, not scattered conditionals.

## Reject incidental complexity
- No shallow abstractions, vague `util`/`helper` grab-bags, mega-services, or repository-per-table.
- Don't add a layer until duplication or a real seam demands it.

## Reuse before writing
- Before writing new code, find the code that already owns that concept and use it.
  Re-declaring an existing type or copying a function is a defect, in research
  scripts too.
- Aim for the fewest lines of code, reached by better structure and sharing,
  never by compressing code, bending formatting, or dropping checks.
- Share one concept, not similar-looking code. Don't split domain-specific
  functions into pieces just so other code can reuse them.
- Starting with a refactor that makes reuse possible is welcome.

## Debuggability first
- Structured errors, typed failure modes, safe telemetry and tracing. Never log secrets or PII.

## Test for confidence, not coverage theater
- Prefer real seams, integration + property tests, and local substitutes (SQLite, in-memory)
  over module mocks/spies. Assert observable behavior, not implementation details.

## Be agent-friendly
- Favor discoverability: explicit interfaces, local conventions, clear checklists.
- Match the surrounding code's idiom.

## Keep comments concise
- Use the fewest words needed to explain information the code does not express:
  intent, constraints, tradeoffs, or non-obvious reasons.
- Do not restate what the code does. Omit comments that add no information.

## Commit messages — Scoped Commits (https://scopedcommits.com)
- Subject: `<scope>: <description>`, e.g. `auth: reject expired refresh tokens`.
  Scope = the subsystem/module touched; match scopes already used in `git log`.
- Multiple areas: use a broader scope, `a, b:`, or `treewide:`.
- Ticket ids go after the scope (`auth (ENG-123): ...`) or in a trailer.
- Optional body explains why; optional trailers last. Not Conventional Commits (`feat:`/`fix:`).
- Reverts and merges keep Git's default format.

Lean on these when unsure: Rust (ownership/safety, errors-as-values),
OCaml (domain modules, exhaustive matching), Effect-style TS (typed effects/errors).

## Visual artwork
- Add AI-generated images or SVG artwork only when I explicitly request it.
  This includes SVG markup hand-written by an agent. A general request to design
  or improve a UI does not authorize generating artwork. Prefer existing assets,
  emoji, or ordinary text/CSS fallbacks unless I ask for custom artwork.
