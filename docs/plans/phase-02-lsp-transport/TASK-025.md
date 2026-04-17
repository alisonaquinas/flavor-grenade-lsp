---
id: "TASK-025"
title: "Handle textDocument/didChange"
type: task
status: open
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-024"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-025"]
---

# Handle textDocument/didChange

> [!INFO] `TASK-025` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Implement the `textDocument/didChange` notification handler. When the client sends content changes, the handler applies them to the stored document in the `DocumentStore` using the incremental edit support from `vscode-languageserver-textdocument`. The `TextDocument.update` method handles applying `TextDocumentContentChangeEvent` arrays to the stored document. The dependency `vscode-languageserver-textdocument` must be added to the project via `bun add`.

---

## Implementation Notes

- Retrieve the document from `DocumentStore` by URI; log a warning and return if not found
- Call `TextDocument.update(doc, changes, version)` from `vscode-languageserver-textdocument`
- Store the updated document back in `DocumentStore`
- Dependency: `bun add vscode-languageserver-textdocument`
- See also: [[adr/ADR001-stdio-transport]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Document lifecycle management | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/handlers/did-change.handler.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Use stdio with Content-Length framing for LSP transport |

---

## Parent Feature

[[tickets/FEAT-003]] — LSP Transport

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-024]] — `DocumentStore` and `textDocument/didOpen` handler must exist first

**Unblocks:**

- [[tickets/TASK-029]] — Integration tests exercise the full document lifecycle

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-003]] child task row updated to `in-review`

---

## Notes

Test with both full-text replacement changes (`TextDocumentSyncKind.Full`) and incremental changes to confirm the library applies them correctly.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-003]].
