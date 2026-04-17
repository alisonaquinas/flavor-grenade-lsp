---
id: "TASK-010"
title: "Create LspModule skeleton"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: in-review
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-003", "TASK-007"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-010"]
---

# Create LspModule skeleton

> [!INFO] `TASK-010` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `src/lsp/lsp.module.ts` containing the `LspModule` NestJS module class decorated with `@Module`. At this phase the module is an empty skeleton with empty `imports`, `providers`, and `exports` arrays. This file is the root NestJS module that `src/main.ts` bootstraps. In subsequent phases, LSP transport providers, parser modules, and vault index modules will be registered here. The skeleton must compile cleanly under the `tsconfig.json` established in TASK-007.

---

## Implementation Notes

- File: `src/lsp/lsp.module.ts`
- Use the `@Module` decorator from `@nestjs/common`
- All three arrays (`imports`, `providers`, `exports`) are empty at this phase — placeholders only
- Exported class name must be exactly `LspModule` to match the import in `src/main.ts`
- See also: [[adr/ADR001-stdio-transport]], [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Module skeleton; LSP functional requirements addressed in Phase 2+ | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets the empty module skeleton |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — empty skeleton with no injectable behaviour to test at this phase | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | `LspModule` is the root NestJS module; stdio transport provider will be registered here in Phase 2 |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-003]] — `@nestjs/common` must be installed to use the `@Module` decorator.
- [[tickets/TASK-007]] — `tsconfig.json` must exist for TypeScript to compile decorators.

**Unblocks:**

- [[tickets/TASK-009]] — `src/main.ts` imports `LspModule`; this file must exist first.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `src/lsp/lsp.module.ts` exists
- [ ] Exports `LspModule` class decorated with `@Module({ imports: [], providers: [], exports: [] })`
- [ ] `bun run build` exits 0 with both `src/main.ts` and `src/lsp/lsp.module.ts` present
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

The `lsp/` subdirectory must be created as part of this task. If TASK-015 (directory structure) runs first, the directory will already exist. Either order is acceptable — the directory creation is idempotent.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-002]].

> [!INFO] In-review — 2026-04-17
> Implementation complete. Gate command `bun run gate:1` passed. Status: `in-review`.
