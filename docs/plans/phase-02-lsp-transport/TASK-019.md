---
id: "TASK-019"
title: "Implement JSON-RPC dispatcher"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-017", "TASK-018"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-019"]
---

# Implement JSON-RPC dispatcher

> [!INFO] `TASK-019` · Task · Phase 2 · Parent: [[FEAT-003]] · Status: `open`

## Description

Create `src/transport/json-rpc-dispatcher.ts`, implementing a `JsonRpcDispatcher` class that receives raw message objects from the `StdioReader`, routes `method` strings to registered request or notification handlers, sends JSON-RPC response objects (with matching `id`) for requests, and sends no response for notifications (messages without `id`). The dispatcher must emit correct JSON-RPC error codes: `-32700` for parse errors, `-32601` for method not found, and `-32603` for internal errors.

---

## Implementation Notes

- `onRequest` registers a typed async handler for a method name
- `onNotification` registers a typed fire-and-forget handler for a method name
- `dispatch` parses the incoming object, determines request vs notification by presence of `id`, routes to handler, and sends the response or error via `StdioWriter`
- `sendNotification` sends an outbound notification (no `id`) to the client
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// src/transport/json-rpc-dispatcher.ts
export type RequestHandler<P, R> = (params: P) => Promise<R>;
export type NotificationHandler<P> = (params: P) => void | Promise<void>;

export class JsonRpcDispatcher {
  onRequest<P, R>(method: string, handler: RequestHandler<P, R>): void;
  onNotification<P>(method: string, handler: NotificationHandler<P>): void;
  dispatch(message: JsonRpcMessage): Promise<void>;
  sendNotification(method: string, params: unknown): void;
}
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | JSON-RPC protocol routing | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/workspace.feature` | `Server completes LSP handshake` |
| `bdd/features/workspace.feature` | `Unknown method returns Method Not Found error` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/transport/json-rpc-dispatcher.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Use stdio with Content-Length framing for LSP transport |

---

## Parent Feature

[[FEAT-003]] — LSP Transport

---

## Dependencies

**Blocked by:**

- [[TASK-017]] — Reader must exist to supply messages to the dispatcher
- [[TASK-018]] — Writer must exist for the dispatcher to send responses

**Unblocks:**

- [[TASK-020]] through [[TASK-028]] — All LSP handler tasks require a dispatcher

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
- [ ] Parent feature [[FEAT-003]] child task row updated to `in-review`

---

## Notes

Test the three error-code paths explicitly: parse error, method not found, and internal error propagation from a handler that throws.

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
> Ticket created. Status: `open`. Parent: [[FEAT-003]].

> [!SUCCESS] Done — 2026-04-17
> RED and GREEN commits landed. All tests pass. Status: `done`.
