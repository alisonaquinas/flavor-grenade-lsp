---
id: "TASK-018"
title: "Implement stdio Content-Length writer"
type: task
status: open
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/2"]
aliases: ["TASK-018"]
---

# Implement stdio Content-Length writer

> [!INFO] `TASK-018` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Create `src/transport/stdio-writer.ts`, implementing a `StdioWriter` class that serialises a message object to JSON, calculates the UTF-8 byte length of the body, prepends the `Content-Length: N\r\n\r\n` header, and writes the complete framed message to a `NodeJS.WritableStream`. The writer is the outbound complement to the `StdioReader` and must produce frames that are valid per the LSP Content-Length framing specification.

---

## Implementation Notes

- No buffering needed; each `write()` call emits a complete frame synchronously
- Use `Buffer.byteLength(body, 'utf8')` — not `body.length` — for correct multibyte character handling
- See also: [[adr/ADR001-stdio-transport]]

```typescript
// src/transport/stdio-writer.ts
export class StdioWriter {
  constructor(private readonly output: NodeJS.WritableStream) {}
  write(message: object): void {
    const body = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n`;
    this.output.write(header + body, 'utf8');
  }
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
| `tests/unit/transport/stdio-writer.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-019]] — JSON-RPC dispatcher requires a working writer to send responses

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

Test cases should verify correct byte-length calculation for messages containing multibyte Unicode characters.

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
