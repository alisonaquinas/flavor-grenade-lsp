---
id: "TASK-020"
title: "Handle initialize request"
type: task
status: open
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-019"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-020"]
---

# Handle initialize request

> [!INFO] `TASK-020` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Create `src/lsp/handlers/initialize.handler.ts` implementing the `initialize` request handler. The handler receives the client's `InitializeParams`, returns an `InitializeResult` containing the server's capability set and identity, and seeds a `CapabilityRegistry` that later phases will augment. For Phase 2 the capability set is minimal: `textDocumentSync: TextDocumentSyncKind.Full` only.

---

## Implementation Notes

- Use a `CapabilityRegistry` injectable that each phase's module populates; the handler reads from it rather than hardcoding capabilities
- `serverInfo.name` must be `'flavor-grenade-lsp'`, `serverInfo.version` must be `'0.1.0'`
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// Phase 2 capability response shape
{
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Full,
  },
  serverInfo: {
    name: 'flavor-grenade-lsp',
    version: '0.1.0',
  },
}
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | LSP capability negotiation | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/handlers/initialize.handler.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-021]] — `initialized` notification follows `initialize` response

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

The `CapabilityRegistry` design must accommodate future phases adding capabilities without modifying this handler.

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
