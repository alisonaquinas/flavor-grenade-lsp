---
id: "TASK-014"
title: "Create package.json scripts"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: in-review
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002", "TASK-005", "TASK-006", "TASK-007", "TASK-008"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-014"]
---

# Create package.json scripts

> [!INFO] `TASK-014` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Add the canonical `scripts` block to `package.json`. The scripts defined here are the single interface for all project operations: `dev` (watch-mode development server), `build` (TypeScript compilation), `start` (production launch from compiled output), `test` (Bun test runner), `bdd` (Cucumber BDD runner), `lint` (ESLint), `lint:fix` (ESLint with auto-fix), `format` (Prettier write), and `gate:1` (Phase 1 CI gate — runs build then test sequentially). The `gate:1` script is the canonical verification command for this phase's acceptance criteria.

---

## Implementation Notes

- Edit `package.json` `scripts` section to contain the full set of scripts from the phase plan
- `"dev": "bun --watch src/main.ts"` — hot-reload during development
- `"build": "tsc --project tsconfig.json"` — compile TypeScript to `dist/`
- `"start": "node dist/main.js"` — run compiled output
- `"test": "bun test"` — Bun's built-in test runner
- `"bdd": "cucumber-js"` — BDD acceptance test runner
- `"lint": "eslint src/"` — ESLint check
- `"lint:fix": "eslint src/ --fix"` — ESLint auto-fix
- `"format": "prettier --write src/"` — Prettier format
- `"gate:1": "bun run build && bun test"` — Phase 1 CI gate (both must pass)
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Script configuration; `gate:1` is the Phase 1 acceptance gate | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets script configuration directly |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — configuration only | — | N/A — verified by `bun run gate:1` passing as part of FEAT-002 acceptance criteria |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | `gate:1` command must pass before Phase 2 begins; it is the Phase 1 completion signal |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — `package.json` must exist to add scripts.
- [[tickets/TASK-005]] — `eslint`, `prettier`, `typescript` must be installed for scripts to be meaningful.
- [[tickets/TASK-006]] — `cucumber-js` must be installed for the `bdd` script.
- [[tickets/TASK-007]] — `tsconfig.json` must exist for `tsc --project tsconfig.json` to work.
- [[tickets/TASK-008]] — `bunfig.toml` must exist for `bun test` to pick up test configuration.

**Unblocks:**

- [[tickets/CHORE-001]] — Lint sweep runs `bun run lint --max-warnings 0`.
- [[tickets/FEAT-002]] acceptance criteria — `bun run build` and `bun test` gate.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `package.json` `scripts` block contains all nine scripts: `dev`, `build`, `start`, `test`, `bdd`, `lint`, `lint:fix`, `format`, `gate:1`
- [ ] `bun run build` invokes `tsc --project tsconfig.json` (verified by running it)
- [ ] `bun test` invokes Bun's test runner (verified by running it)
- [ ] `bun run lint` invokes `eslint src/` (verified by running it)
- [ ] `bun run gate:1` runs both build and test sequentially
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

Script names are canonical for this project. Do not rename them — the `gate:1` naming convention is followed in all subsequent phases (`gate:2`, `gate:3`, etc.) and is referenced in [[plans/execution-ledger]].

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
