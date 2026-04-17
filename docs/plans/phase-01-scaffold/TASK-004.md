---
id: "TASK-004"
title: "Install LSP protocol types"
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
aliases: ["TASK-004"]
---

# Install LSP protocol types

> [!INFO] `TASK-004` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Install the Language Server Protocol type definition packages required by all subsequent LSP handler phases. `vscode-languageserver-protocol` and `vscode-languageserver-types` provide the full LSP type surface (request/response shapes, `TextDocumentIdentifier`, `Position`, `Range`, `Diagnostic`, etc.) without pulling in a full VS Code runtime dependency. The `@types/node` dev dependency is also installed here to provide Node.js built-in type definitions for `process.stdin`, `process.stdout`, and stream types needed by the stdio transport.

---

## Implementation Notes

- Command: `bun add vscode-languageserver-protocol vscode-languageserver-types`
- Command: `bun add --dev @types/node`
- These packages are consumed by LSP handler modules in Phase 2 and beyond; installing them now ensures TypeScript can resolve imports immediately
- See also: [[adr/ADR001-stdio-transport]], [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Type installation; functional requirements targeted by LSP capability phases | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets type package installation |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — type-only package install; no runtime behaviour to test | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | LSP transport uses stdio; `vscode-languageserver-protocol` provides the JSON-RPC message type definitions |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — `package.json` must exist before packages can be installed.

**Unblocks:**

- All Phase 2 LSP handler tasks that import from `vscode-languageserver-protocol`.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bun add` commands complete without error
- [ ] `package.json` `dependencies` contains `vscode-languageserver-protocol` and `vscode-languageserver-types`
- [ ] `package.json` `devDependencies` contains `@types/node`
- [ ] `bun.lockb` (or `bun.lock`) updated
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

Both `vscode-languageserver-protocol` and `vscode-languageserver-types` are production dependencies because the LSP type definitions are referenced in compiled output types, not only in tests or tooling.

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
