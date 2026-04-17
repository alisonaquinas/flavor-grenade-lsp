---
id: "TASK-017"
title: "Implement stdio Content-Length reader"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/2"]
aliases: ["TASK-017"]
---

# Implement stdio Content-Length reader

> [!INFO] `TASK-017` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Create `src/transport/stdio-reader.ts`, implementing a `StdioReader` class that buffers bytes from a `NodeJS.ReadableStream`, parses the `Content-Length: N` header, skips the `\r\n\r\n` separator, reads exactly N bytes as the message body, and emits each complete body as a UTF-8 string event. The reader must handle partial reads correctly using TCP-style backpressure so that fragmented delivery of a single message does not corrupt parsing.

---

## Implementation Notes

- Extends `EventEmitter`; call `start()` to attach the `data` listener
- Internal buffer accumulates chunks until a complete header+body pair is available
- Header parsing: scan for `Content-Length:`, extract numeric value, advance past `\r\n\r\n`
- Body read: slice exactly N bytes from the buffer, emit as `'message'` event, shift buffer
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// src/transport/stdio-reader.ts
export class StdioReader extends EventEmitter {
  constructor(private readonly input: NodeJS.ReadableStream) { super(); }
  start(): void { /* attach data listener, parse header+body */ }
}
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Transport framing correctness | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/transport/stdio-reader.spec.ts` | Unit | — | 🔴 failing |

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

- None

**Unblocks:**

- [[tickets/TASK-019]] — JSON-RPC dispatcher requires a working reader to receive messages

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

Partial-read handling is the core difficulty: a single `data` event may contain less than a full message, more than one message, or a message boundary mid-buffer.

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
