---
id: "TASK-281"
title: "Move executable BDD assets out of docs"
type: task
status: open
priority: high
phase: "18"
parent: "FEAT-033"
created: "2026-05-12"
updated: "2026-05-12"
dependencies: ["TASK-280"]
tags: [tickets/task, "phase/18", bdd, docs, refactor]
aliases: ["TASK-281"]
---

# Move Executable BDD Assets Out Of Docs

> [!INFO] `TASK-281` · Task · Phase 18 · Parent: [[FEAT-033]] · Status: `open`

## Description

Refactor executable BDD assets out of `docs/` so documentation contains only
documentation, while the default BDD gate continues to run from an appropriate
test-source location.

## Scope of Change

**Move:**

- `docs/bdd/features/**/*.feature` to a test-owned path such as
  `src/test/bdd/features/**/*.feature` or another established test fixture
  location.

**Update:**

- `cucumber.yaml` paths.
- BDD links in tickets, requirements, and test index/matrix references.
- Any documentation that describes where executable BDD scenarios live.

**Do not move:**

- Human-readable requirements, plans, ADRs, or design docs.

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `CICD.Workflow.PRGate` | The default BDD gate must remain executable after relocation. | [[requirements/ci-cd]] |
| `Quality.SourceLayout.DocsBoundary` | Documentation folders must not contain raw executable source or test assets. | [[requirements/code-quality]] |

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `cucumber.yaml` | BDD gate config | `CICD.Workflow.PRGate` | pending |
| `src/test/bdd/features/**/*.feature` | BDD scenarios | `CICD.Workflow.PRGate` | pending |

## Definition of Done

- [ ] No executable `.feature` files remain under `docs/`.
- [ ] `bun run bdd` exits 0 from the new feature-file location.
- [ ] Documentation links and test matrix/index references point to the new
  location.
- [ ] No generated report files are committed.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-12
> User review found executable test assets intermingled with documentation
> under `docs/bdd`. This task tracks moving those raw test assets into an
> appropriate test-source location. Status: `open`.
