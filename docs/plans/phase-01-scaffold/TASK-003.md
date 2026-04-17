---
id: "TASK-003"
title: "Install NestJS core packages"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-003"]
---

# Install NestJS core packages

> [!INFO] `TASK-003` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Install the NestJS runtime dependencies required for the LSP server application context. The packages `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `reflect-metadata`, and `rxjs` must be added as production dependencies. NestJS requires `reflect-metadata` to be imported as the very first line of `src/main.ts` to enable decorator metadata emission; this constraint is enforced by the `tsconfig.json` `emitDecoratorMetadata` flag being set to `true`.

---

## Implementation Notes

- Command: `bun add @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs`
- After installation, verify entries appear in `package.json` `dependencies` section
- `import 'reflect-metadata'` must be the first line of `src/main.ts` (see TASK-009)
- See also: [[architecture/overview]], [[adr/ADR001-stdio-transport]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Infrastructure dependency install; no functional requirement tag yet assigned | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets package installation directly |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — dependency install task; verified by `bun run build` passing in TASK-007+ | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | NestJS application context bootstrapped without HTTP server for stdio LSP transport |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — `package.json` must exist before packages can be installed.

**Unblocks:**

- [[tickets/TASK-009]] — `src/main.ts` references NestJS imports; those packages must be installed first.
- [[tickets/TASK-010]] — `LspModule` references `@nestjs/common`; must be installed first.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bun add` command completes without error
- [ ] `package.json` `dependencies` contains all five packages: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`
- [ ] `bun.lockb` (or `bun.lock`) updated
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

`@nestjs/platform-express` is included for NestJS internal compatibility even though the LSP server does not expose HTTP endpoints. The application context is created via `NestFactory.createApplicationContext`, not `NestFactory.create`, so the Express adapter is dormant.

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
