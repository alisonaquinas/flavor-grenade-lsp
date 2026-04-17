---
id: "TASK-013"
title: "Configure Prettier"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: in-review
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-005"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-013"]
---

# Configure Prettier

> [!INFO] `TASK-013` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `.prettierrc.json` at the project root to define the canonical code formatting rules for all TypeScript source files. The configuration enforces: semicolons required (`"semi": true`), single quotes for strings (`"singleQuote": true`), trailing commas in all positions (`"trailingComma": "all"`), maximum line width of 100 characters (`"printWidth": 100`), and two-space indentation (`"tabWidth": 2`). These settings are the project-wide formatting standard and all new source files must conform to them.

---

## Implementation Notes

- File: `.prettierrc.json` (project root)
- Content: `{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2 }`
- Prettier is invoked via `bun run format` (defined in TASK-014) which runs `prettier --write src/`
- The `eslint-config-prettier` package (installed in TASK-005) disables conflicting ESLint rules
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Formatting configuration; code quality requirements addressed by CHORE-002 | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets Prettier configuration |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — pure configuration file; no test | — | N/A — verified by `bun run format --check` passing after CHORE-001 |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Consistent formatting required across all source files; Prettier is the single formatting authority |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-005]] — Prettier package must be installed.

**Unblocks:**

- [[tickets/CHORE-001]] — Lint sweep includes format check.
- [[tickets/CHORE-002]] — Code quality sweep verifies formatting consistency.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `.prettierrc.json` exists at project root
- [ ] Contains `"semi": true`, `"singleQuote": true`, `"trailingComma": "all"`, `"printWidth": 100`, `"tabWidth": 2`
- [ ] `bunx prettier --check src/` runs without crashing on the skeleton source files
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

`trailingComma: "all"` includes trailing commas in function parameters (requires TypeScript or a transpiler). This is the standard for modern TypeScript projects and is supported by all major editors.

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
