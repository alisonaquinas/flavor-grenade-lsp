---
id: "TASK-002"
title: "Initialize Bun project"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/task, "phase/1"]
aliases: ["TASK-002"]
---

# Initialize Bun project

> [!INFO] `TASK-002` · Task · Phase 1 · Parent: [[FEAT-002]] · Status: `open`

## Description

Run `bun init -y` in the project root to create the initial `package.json`. After initialisation, ensure the generated `package.json` has `"type": "module"` and `"name": "flavor-grenade-lsp"`. This is a pure infrastructure task — it creates no source files and has no test coverage; completion is verified by confirming that `bun --version` passes and `package.json` exists with the required fields.

---

## Implementation Notes

- Command: `bun init -y`
- After running, open `package.json` and verify or set `"type": "module"` and `"name": "flavor-grenade-lsp"`
- DoD is: `bun --version` passes (Bun ≥ 1.1 installed) and `package.json` exists with the required fields
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Infrastructure initialisation; no functional requirement tag yet assigned | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets project initialisation directly |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — infrastructure task; no test files | — | N/A — DoD verified by `bun --version` and presence of `package.json` |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | LSP server uses stdio transport — Bun project must support ESM modules |

---

## Parent Feature

[[FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[FEAT-001]] — Phase 0 documentation must be complete before any `src/` or project files are created.

**Unblocks:**

- [[TASK-003]] — NestJS packages can only be installed after `package.json` exists.
- [[TASK-004]] — LSP protocol types install depends on `package.json` existing.
- [[TASK-005]] — Dev tooling install depends on `package.json` existing.
- [[TASK-006]] — Test dependencies install depends on `package.json` existing.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bun --version` outputs a version ≥ 1.1
- [ ] `package.json` exists at project root
- [ ] `package.json` contains `"type": "module"`
- [ ] `package.json` contains `"name": "flavor-grenade-lsp"`
- [ ] Parent feature [[FEAT-002]] child task row updated to `in-review`

---

## Notes

This is a pure infrastructure initialisation step. No TypeScript files are created. No tests are written. The verification is manual inspection of `package.json` and a successful `bun --version` call.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-002]].

> [!INFO] In-review — 2026-04-17
> Implementation complete. Gate command `bun run gate:1` passed. Status: `in-review`.
