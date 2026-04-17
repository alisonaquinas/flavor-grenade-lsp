---
id: "FEAT-003"
title: "LSP Transport"
type: feature
status: done
priority: high
phase: 2
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-002"]
tags: [tickets/feature, "phase/2"]
aliases: ["FEAT-003"]
---

# LSP Transport

> [!INFO] `FEAT-003` · Feature · Phase 2 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain an LSP server that can complete the Language Server Protocol handshake with any compliant client. The server accepts a connection, negotiates capabilities, receives document lifecycle notifications, and responds correctly to the shutdown sequence — enabling editors to recognise and speak with the flavor-grenade-lsp server as a first-class language server.

---

## Scope

**In scope:**

- JSON-RPC stdio framing (Content-Length reader and writer)
- LSP capability negotiation (`initialize` / `initialized`)
- Shutdown and exit lifecycle (`shutdown` / `exit`)
- Text document synchronisation notifications (`textDocument/didOpen`, `textDocument/didChange`, `textDocument/didClose`)
- Custom `flavorGrenade/status` outbound notification
- NestJS DI wiring for all handler classes
- TDD integration tests covering the full handshake sequence

**Out of scope (explicitly excluded):**

- OFM parsing (Phase 3)
- Vault indexing (Phase 4)
- Diagnostics, completions, or navigation features (Phase 5+)
- WebSocket or TCP transport variants

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Transport layer has no direct user-visible requirement; it is infrastructure for all user-facing features | — |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | See phase plan for protocol-level gate criteria | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/workspace]] | Workspace-level scenarios including the LSP handshake smoke test |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-02-lsp-transport]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `initialize` → `initialized` → `shutdown` → `exit` roundtrip completes with correct JSON-RPC response codes
- [ ] BDD `@smoke` transport scenario in `workspace.feature` passes in CI
- [ ] All scenarios in linked BDD feature files pass in CI
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command `bun run gate:2` passes in CI
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-017]] | Implement stdio Content-Length reader | `done` |
| [[tickets/TASK-018]] | Implement stdio Content-Length writer | `done` |
| [[tickets/TASK-019]] | Implement JSON-RPC dispatcher | `done` |
| [[tickets/TASK-020]] | Handle initialize request | `done` |
| [[tickets/TASK-021]] | Handle initialized notification | `done` |
| [[tickets/TASK-022]] | Handle shutdown request | `done` |
| [[tickets/TASK-023]] | Handle exit notification | `done` |
| [[tickets/TASK-024]] | Handle textDocument/didOpen | `done` |
| [[tickets/TASK-025]] | Handle textDocument/didChange | `done` |
| [[tickets/TASK-026]] | Handle textDocument/didClose | `done` |
| [[tickets/TASK-027]] | Implement flavorGrenade/status notification | `done` |
| [[tickets/TASK-028]] | Register all handlers in LspModule | `done` |
| [[tickets/TASK-029]] | Write TDD integration tests using stdio pipe | `done` |
| [[tickets/CHORE-004]] | Phase 2 Lint Sweep | `done` |
| [[tickets/CHORE-005]] | Phase 2 Code Quality Sweep | `done` |
| [[tickets/CHORE-006]] | Phase 2 Security Sweep | `done` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-002]] — Phase 1 (Project Scaffold) must be complete before transport layer can be built

**Unblocks:**

- [[tickets/FEAT-004]] — Phase 3 OFM Parser requires a working transport layer

---

## Notes

ADR reference: [[adr/ADR001-stdio-transport]] constrains the transport implementation to stdio framing with Content-Length headers as specified by the LSP protocol.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started — 2026-04-17
> Status: `draft` → `in-progress`. Feature branch `feature/phase-02-lsp-transport` created. Steps A–C confirmed: all 13 TASK tickets reviewed, cross-refs verified, implementation details complete. Beginning Step D TDD cycles.

> [!INFO] In-Review — 2026-04-17
> All 13 TASK tickets done. CHORE-004/005/006 done. 27 unit tests + 3 integration tests pass. lint and tsc clean. Status: `in-review`.

---

## Retrospective

### 1. What Went as Planned

- All 13 TASK tickets (TASK-017 through TASK-029) were implemented in strict RED → GREEN TDD order with separate commits.
- Transport layer (StdioReader, StdioWriter, JsonRpcDispatcher) passed all unit tests on the first implementation attempt.
- DocumentStore integration with `vscode-languageserver-textdocument` was straightforward.
- Integration test design (subprocess LspClient helper) worked cleanly and did not require importing from `src/`.
- All three sweep gates (lint, quality, security) passed with minor fixes only.

### 2. Deviations

| Ticket | Type | Description |
|--------|------|-------------|
| CHORE-004 | Lint | ESLint `no-unused-vars` did not recognize `_params` convention by default; fixed by adding `argsIgnorePattern`/`varsIgnorePattern` to config. |
| CHORE-004 | Lint | `Writable.write` callback in test needed explicit `BufferEncoding` and `void` return type annotation to satisfy `explicit-function-return-type`. |

No new CHORE or BUG tickets were required beyond the pre-planned ones.

### 3. Process Observations

- **Notification ordering** was the only non-trivial issue: the `flavorGrenade/status` notification sent from inside `InitializeHandler.handle()` arrived at the client *before* the `initialize` response because `queueMicrotask` still fires before I/O. `setImmediate` correctly defers it to the next I/O tick after the response write.
- `bun test` with `@jest/globals` works well for both unit and integration tests.
- The `LspModule.onModuleInit` pattern for wiring all handlers is clean and NestJS-idiomatic; no lifecycle hook ordering issues arose.
- The `EventEmitter` import must come from `node:events`, not `node:stream` — a minor import hygiene point.

### 4. Carry-Forward Actions

- Phase 3 (OFM Parser) will need to add a `ParseCache` service and hook into `DidOpenHandler` and `DidCloseHandler` via the comments left in those files.
- Phase 4 (Vault Detection) will be triggered from `InitializedHandler` (comment already in place).
- The `setImmediate` deferral pattern in `InitializeHandler` should be documented in the ADR or a design note so future phases follow the same convention for post-response notifications.

### 5. Rule/Template Amendments

- ESLint config template should include `argsIgnorePattern: '^_'` in `no-unused-vars` by default for TypeScript projects to avoid false positives on intentionally-unused parameters named with underscore convention.
