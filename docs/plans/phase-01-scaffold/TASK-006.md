---
id: "TASK-006"
title: "Install test dependencies"
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
aliases: ["TASK-006"]
---

# Install test dependencies

> [!INFO] `TASK-006` · Task · Phase 1 · Parent: [[FEAT-002]] · Status: `open`

## Description

Install the test framework dependencies required for both BDD acceptance tests and unit tests. The packages `@cucumber/cucumber` (for Gherkin BDD scenarios), `jest` and `@jest/globals` (for unit test assertions compatible with Bun's test runner), and `ts-node` (for TypeScript execution of Cucumber step definitions) are added as dev dependencies. These packages underpin the TDD workflow described in the task lifecycle and the BDD acceptance gate described in [[requirements/index]].

---

## Implementation Notes

- Command: `bun add --dev @cucumber/cucumber jest @jest/globals ts-node`
- `@cucumber/cucumber` is used by the `bdd` script (`cucumber-js`) defined in TASK-014
- `bun test` is the primary test runner; `@jest/globals` provides compatible `expect` / `describe` / `it` API
- `ts-node` is needed to execute TypeScript Cucumber step definitions without a pre-compile step
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Test framework installation; quality requirements addressed in later phases | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets test framework installation |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — dev dependency install; no test files yet | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | TDD lifecycle applies to all LSP handler tasks; test framework must be installed before any handler task begins |

---

## Parent Feature

[[FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[TASK-002]] — `package.json` must exist before packages can be installed.

**Unblocks:**

- All Phase 2+ TASK tickets that require writing test files.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bun add --dev` command completes without error
- [ ] `package.json` `devDependencies` contains `@cucumber/cucumber`, `jest`, `@jest/globals`, `ts-node`
- [ ] `bun.lockb` (or `bun.lock`) updated
- [ ] Parent feature [[FEAT-002]] child task row updated to `in-review`

---

## Notes

Bun has a built-in test runner (`bun test`) that is compatible with Jest's `describe`/`it`/`expect` API. The `jest` and `@jest/globals` packages are installed for type-checking test files and for Cucumber step definition compatibility, not as the primary test runner.

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
