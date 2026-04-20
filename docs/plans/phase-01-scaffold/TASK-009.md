---
id: "TASK-009"
title: "Create src/main.ts — NestJS bootstrap"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-003", "TASK-007", "TASK-010"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-009"]
---

# Create src/main.ts — NestJS bootstrap

> [!INFO] `TASK-009` · Task · Phase 1 · Parent: [[FEAT-002]] · Status: `open`

## Description

Create `src/main.ts` as the NestJS application entry point. The file must begin with `import 'reflect-metadata'` as its very first line — NestJS requires this to activate decorator metadata emission at runtime. It then imports `NestFactory` and `LspModule` to create an application context (not an HTTP server) and initialises it. The `bootstrap` function is typed as returning `Promise<void>` and is invoked at module level with `.catch(console.error)` to surface any initialisation failures.

---

## Implementation Notes

- File: `src/main.ts`
- First line must be: `import 'reflect-metadata';`
- Use `NestFactory.createApplicationContext(LspModule, { logger: ['error', 'warn'] })` — not `NestFactory.create()` — as no HTTP listener is needed
- `await app.init()` triggers NestJS module initialisation lifecycle
- See also: [[adr/ADR001-stdio-transport]], [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Entry point bootstrap; functional requirements addressed in Phase 2 LSP transport tasks | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets the bootstrap entry point directly |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-lsp-module.md` | Unit | — | Conceptual — unit test for `LspModule` scaffold to be created in Phase 2 |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Application context created without HTTP listener; stdio transport attached in Phase 2 |

---

## Parent Feature

[[FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[TASK-003]] — NestJS packages (`@nestjs/core`, `reflect-metadata`) must be installed.
- [[TASK-007]] — `tsconfig.json` must be present for TypeScript compilation to succeed.
- [[TASK-010]] — `LspModule` must exist before `src/main.ts` can import it.

**Unblocks:**

- Phase 2 transport tasks that extend the bootstrap with stdio stream wiring.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `src/main.ts` exists
- [ ] First line is `import 'reflect-metadata';`
- [ ] File imports `NestFactory` from `@nestjs/core` and `LspModule` from `./lsp/lsp.module`
- [ ] `bootstrap` function is typed `async function bootstrap(): Promise<void>`
- [ ] `bun run build` exits 0 with `src/main.ts` present (after TASK-010 is also complete)
- [ ] Parent feature [[FEAT-002]] child task row updated to `in-review`

---

## Notes

`NestFactory.createApplicationContext` is preferred over `NestFactory.create` because the LSP server communicates over stdio, not HTTP. The Express platform adapter installed in TASK-003 is present for NestJS internal compatibility only and is not activated.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-002]].

> [!INFO] In-review — 2026-04-17
> Implementation complete. Gate command `bun run gate:1` passed. Status: `in-review`.
