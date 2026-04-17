---
id: "TASK-027"
title: "Implement flavorGrenade/status notification"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-019"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-027"]
---

# Implement flavorGrenade/status notification

> [!INFO] `TASK-027` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Implement the `flavorGrenade/status` custom outbound notification. The server sends this notification to the client whenever its internal state changes — for example, when it transitions from `initializing` to `ready`, when vault indexing begins or completes, or when an error occurs. This notification is defined as a custom extension to the LSP protocol and is sent via the `JsonRpcDispatcher.sendNotification` method introduced in TASK-019.

---

## Implementation Notes

- Implement a `StatusNotifier` service that wraps `JsonRpcDispatcher.sendNotification`
- The method name is `'flavorGrenade/status'`
- In Phase 2, send `{ status: 'initializing' }` on server startup and `{ status: 'ready' }` after `initialized` is received
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// src/lsp/notifications/flavor-grenade-status.ts
interface FlavorGrenadeStatusParams {
  status: 'initializing' | 'ready' | 'indexing' | 'error';
  message?: string;
  vaultMode?: 'obsidian' | 'flavor-grenade' | 'single-file';
}
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Custom server-to-client status signalling | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/notifications/flavor-grenade-status.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-019]] — `sendNotification` on the dispatcher is required

**Unblocks:**

- [[tickets/TASK-028]] — `LspModule` wiring includes `StatusNotifier`

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

The `FlavorGrenadeStatusParams` type must be exported from a shared types file so that future phases can use it without circular imports.

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
