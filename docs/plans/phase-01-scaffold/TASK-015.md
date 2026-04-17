---
id: "TASK-015"
title: "Create project directory structure"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-015"]
---

# Create project directory structure

> [!INFO] `TASK-015` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create the canonical `src/` directory tree that all subsequent phases will populate. The required directories are: `src/` (root), `src/lsp/` (LSP handler module — Phase 2), `src/parser/` (OFM parser — Phase 3), `src/vault/` (vault index — Phase 4), `src/test/` (test support), `src/test/support/` (Cucumber world and hooks), and `src/test/steps/` (Cucumber step definitions). Empty placeholder files (`.gitkeep`) must be placed in directories that would otherwise be empty so that git tracks them. The `src/lsp/` directory may already exist if TASK-010 has run first; directory creation is idempotent.

---

## Implementation Notes

- Create all directories listed in the phase plan tree
- Place a `.gitkeep` file in `src/parser/`, `src/vault/`, `src/test/support/`, and `src/test/steps/` to ensure git tracks empty directories
- `src/lsp/` will contain `lsp.module.ts` after TASK-010; no `.gitkeep` needed there
- `src/main.ts` will occupy `src/` after TASK-009
- Do not create any `.ts` source files in this task — directory scaffolding only
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Directory structure; module boundaries defined in architecture layer | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets directory creation |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — directory creation only; no code to test | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | `src/lsp/` is the boundary for the LSP handler layer; `src/parser/` and `src/vault/` are separate bounded contexts per [[architecture/overview]] |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — Project root must exist before `src/` can be created.

**Unblocks:**

- [[tickets/TASK-009]] — `src/main.ts` requires `src/` directory.
- [[tickets/TASK-010]] — `src/lsp/lsp.module.ts` requires `src/lsp/` directory.
- All Phase 2+ tasks that place files in `src/parser/`, `src/vault/`, `src/test/`.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `src/` directory exists
- [ ] `src/lsp/` directory exists
- [ ] `src/parser/` directory exists with `.gitkeep`
- [ ] `src/vault/` directory exists with `.gitkeep`
- [ ] `src/test/` directory exists
- [ ] `src/test/support/` directory exists with `.gitkeep`
- [ ] `src/test/steps/` directory exists with `.gitkeep`
- [ ] `git status` shows `.gitkeep` files tracked (not ignored)
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

`.gitkeep` is a conventional empty file used to force git to track otherwise-empty directories. It has no runtime significance and must not be imported by any TypeScript source file.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-002]].
