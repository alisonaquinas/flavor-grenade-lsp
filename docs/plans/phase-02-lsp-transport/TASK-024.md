---
id: "TASK-024"
title: "Handle textDocument/didOpen"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-019"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-024"]
---

# Handle textDocument/didOpen

> [!INFO] `TASK-024` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Implement the `textDocument/didOpen` notification handler and the `DocumentStore` service that backs it. When a document is opened the handler stores its URI, text content, and version number in the `DocumentStore`. No OFM parsing is triggered in Phase 2; the store holds the raw text for later phases to process. The `DocumentStore` is implemented as a NestJS injectable with a well-defined interface.

---

## Implementation Notes

- `DocumentStore` must expose `open`, `update`, `close`, and `get` methods
- Use `vscode-languageserver-textdocument` for the `TextDocument` type
- No OFM parsing — store raw text only; leave a `// Phase 3: trigger OFMParser` comment
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// src/lsp/document-store.ts
export class DocumentStore {
  open(uri: string, text: string, version: number): void;
  update(uri: string, changes: TextDocumentContentChangeEvent[], version: number): void;
  close(uri: string): void;
  get(uri: string): TextDocument | undefined;
}
```

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
| `tests/unit/lsp/document-store.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-019]] — Dispatcher must exist to register the handler

**Unblocks:**

- [[tickets/TASK-025]] — `textDocument/didChange` handler uses the same `DocumentStore`
- [[tickets/TASK-026]] — `textDocument/didClose` handler uses the same `DocumentStore`

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

`DocumentStore` is shared state; it must be registered as a singleton-scoped NestJS provider.

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

> [!SUCCESS] Done — 2026-04-17
> RED and GREEN commits landed. All tests pass. Status: `done`.
