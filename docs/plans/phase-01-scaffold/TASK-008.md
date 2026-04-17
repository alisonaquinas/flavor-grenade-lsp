---
id: "TASK-008"
title: "Configure bunfig.toml"
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
aliases: ["TASK-008"]
---

# Configure bunfig.toml

> [!INFO] `TASK-008` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `bunfig.toml` at the project root to configure Bun's test runner and package installation behaviour. The `[test]` section sets the test root to `src` and enables coverage collection. The `[install]` section sets `exact = true` to pin all installed package versions exactly (no semver ranges in `package.json`), ensuring reproducible builds. This configuration is the single source of truth for Bun's runtime behaviour in the project.

---

## Implementation Notes

- Create `bunfig.toml` at project root with the following content:
  ```toml
  [test]
  root = "src"
  coverage = true

  [install]
  exact = true
  ```
- `exact = true` means newly installed packages are pinned to exact versions, not semver ranges
- `coverage = true` enables coverage output for `bun test` without additional flags
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Bun runtime configuration; no functional requirement tag yet assigned | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets `bunfig.toml` configuration |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — pure configuration file; no test | — | N/A — verified by `bun test` running correctly after all TASK tickets complete |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Bun is the runtime; `bunfig.toml` configures its behaviour for this project |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — Project must be initialised before runtime configuration is meaningful.

**Unblocks:**

- [[tickets/TASK-014]] — `package.json` scripts rely on Bun runtime being correctly configured.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bunfig.toml` exists at project root
- [ ] Contains `[test]` section with `root = "src"` and `coverage = true`
- [ ] Contains `[install]` section with `exact = true`
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

`bunfig.toml` is Bun's own configuration format. It is separate from `package.json` and controls Bun-specific behaviour not expressible in standard Node.js configuration files.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-002]].
