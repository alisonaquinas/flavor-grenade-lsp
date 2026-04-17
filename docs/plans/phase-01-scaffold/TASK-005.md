---
id: "TASK-005"
title: "Install development tooling"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: in-review
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-005"]
---

# Install development tooling

> [!INFO] `TASK-005` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Install the development-time tooling required for type checking, linting, and code formatting. The packages `typescript`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `prettier`, and `eslint-config-prettier` are added as dev dependencies. TypeScript is the compiler that enforces all `tsconfig.json` constraints; ESLint with the TypeScript plugin enforces code style and quality rules; Prettier handles formatting; `eslint-config-prettier` disables ESLint formatting rules that would conflict with Prettier.

---

## Implementation Notes

- Command: `bun add --dev typescript eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier`
- After installation, verify `tsc --version` is accessible via `bunx tsc --version`
- These packages are consumed by the scripts configured in TASK-014 (`build`, `lint`, `format`)
- See also: [[adr/ADR001-stdio-transport]], [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Dev tooling install; quality requirements addressed by CHORE-001 and CHORE-002 | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets dev tooling installation |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — dev dependency install; no runtime behaviour to test | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | TypeScript strict mode required; tooling must enforce `noImplicitAny` and `strict` |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — `package.json` must exist before packages can be installed.

**Unblocks:**

- [[tickets/TASK-007]] — `tsconfig.json` references the TypeScript compiler installed here.
- [[tickets/TASK-012]] — ESLint config requires the ESLint packages installed here.
- [[tickets/TASK-013]] — Prettier config requires the Prettier package installed here.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bun add --dev` command completes without error
- [ ] `package.json` `devDependencies` contains `typescript`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `prettier`, `eslint-config-prettier`
- [ ] `bunx tsc --version` outputs a TypeScript version
- [ ] `bun.lockb` (or `bun.lock`) updated
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

`eslint-config-prettier` must be the last entry in the ESLint config's `extends` array (configured in TASK-012) to ensure it correctly overrides conflicting rules.

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
