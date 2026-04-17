---
id: "FEAT-003"
title: "LSP Transport"
type: feature
status: draft
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
| [[tickets/TASK-017]] | Implement stdio Content-Length reader | `open` |
| [[tickets/TASK-018]] | Implement stdio Content-Length writer | `open` |
| [[tickets/TASK-019]] | Implement JSON-RPC dispatcher | `open` |
| [[tickets/TASK-020]] | Handle initialize request | `open` |
| [[tickets/TASK-021]] | Handle initialized notification | `open` |
| [[tickets/TASK-022]] | Handle shutdown request | `open` |
| [[tickets/TASK-023]] | Handle exit notification | `open` |
| [[tickets/TASK-024]] | Handle textDocument/didOpen | `open` |
| [[tickets/TASK-025]] | Handle textDocument/didChange | `open` |
| [[tickets/TASK-026]] | Handle textDocument/didClose | `open` |
| [[tickets/TASK-027]] | Implement flavorGrenade/status notification | `open` |
| [[tickets/TASK-028]] | Register all handlers in LspModule | `open` |
| [[tickets/TASK-029]] | Write TDD integration tests using stdio pipe | `open` |
| [[tickets/CHORE-004]] | Phase 2 Lint Sweep | `open` |
| [[tickets/CHORE-005]] | Phase 2 Code Quality Sweep | `open` |
| [[tickets/CHORE-006]] | Phase 2 Security Sweep | `open` |

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
