---
id: "TASK-281"
title: "Move BDD step source notes out of docs"
type: task
status: done
priority: high
phase: "18"
parent: "FEAT-033"
created: "2026-05-12"
updated: "2026-05-12"
dependencies: ["TASK-280"]
tags: [tickets/task, "phase/18", bdd, docs, refactor]
aliases: ["TASK-281"]
---

# Move BDD Step Source Notes Out Of Docs

> [!INFO] `TASK-281` · Task · Phase 18 · Parent: [[FEAT-033]] · Status: `done`

## Description

Refactor BDD step implementation notes out of `docs/` so documentation contains
requirements and design prose, while source-adjacent test implementation
references live with the BDD harness.

## Scope of Change

**Move:**

- `docs/bdd/steps/README.md` to a source-adjacent BDD harness location such as
  `src/test/bdd/step-definitions/STEP-MAP.md`.

**Update:**

- Any documentation that describes where BDD step implementation references
  live.

**Do not move:**

- Human-readable requirements, plans, ADRs, or design docs.
- Gherkin `.feature` files; per user clarification, they may remain under
  `docs/bdd/features/`.

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Quality.SourceLayout.DocsBoundary` | Documentation folders must not contain raw executable source or test assets. | [[docs/requirements/technical/code-quality]] |

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/test/bdd/bdd-layout.test.ts` | Unit | `Quality.SourceLayout.DocsBoundary` | passing |
| `src/test/bdd/step-definitions/STEP-MAP.md` | Harness documentation | `Quality.SourceLayout.DocsBoundary` | passing |

## Definition of Done

- [x] `docs/bdd/steps/` is removed.
- [x] BDD step implementation notes live next to the BDD step definitions.
- [x] `bun run bdd` continues to exit 0.
- [x] No generated report files are committed.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-12
> User review found executable test assets intermingled with documentation
> under `docs/bdd`. This task tracks moving those raw test assets into an
> appropriate test-source location. Status: `open`.

> [!FAILURE] Red layout test · 2026-05-12
> Added `src/test/bdd/bdd-layout.test.ts` to require raw source files to stay
> out of `docs/` and require BDD step implementation notes to move out of
> `docs/bdd/steps/`. Status: `red`.

> [!INFO] Scope clarified · 2026-05-12
> User clarified that `.feature` files can remain in place. Narrowed this task
> to moving BDD step implementation notes out of `docs/bdd/steps/` and into the
> test harness tree. Status remains `red`.

> [!SUCCESS] Green implementation · 2026-05-12
> Moved the BDD step map to `src/test/bdd/step-definitions/STEP-MAP.md`,
> removed `docs/bdd/steps/`, and verified `bun test
> src/test/bdd/bdd-layout.test.ts` plus `bun run bdd` pass. Status: `green`.

> [!FAILURE] Format gate failed · 2026-05-12
> Full gate rerun found `bun run format:check` fails on
> `src/test/bdd/step-definitions/STEP-MAP.md`. Status: `red`.

> [!SUCCESS] Format gate restored · 2026-05-12
> Ran Prettier on `src/test/bdd/step-definitions/STEP-MAP.md`; `bun run
> format:check` and `bun test src/test/bdd/bdd-layout.test.ts` now pass.
> Status: `green`.

> [!SUCCESS] Review gates passed · 2026-05-12
> Full local verification passed: `bun run lint`, `bun run typecheck`, `bun run
> format:check`, `bun run lint:dependencies`, `bun run lint:docs`, `bun run
> build`, `bun test`, `bun run bdd`, `npm run compile`, `npm test`, `npm run
> verify:marketplace-assets`, `npm run verify:package-targets`, and `npm run
> test:host`. Status: `in-review`.

> [!CHECK] Done · 2026-05-12
> PR #65 CI passed on commit `a7aa510`, including format, tests, docs lint,
> website checks, and build. Acceptance criteria met. Status: `done`.
