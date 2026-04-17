---
id: "TASK-022"
title: "Handle shutdown request"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-019"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-022"]
---

# Handle shutdown request

> [!INFO] `TASK-022` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Implement the `shutdown` request handler. Per the LSP specification the server must respond with `null` when it receives a `shutdown` request and then set a `shutdownRequested` flag that the `exit` notification handler consults when deciding the process exit code. The `shutdown` response must not close the stdio streams or exit the process; only the subsequent `exit` notification triggers process termination.

---

## Implementation Notes

- Return `null` as the result (per LSP 3.17 spec — not `undefined`, not `{}`)
- Set a shared `shutdownRequested: boolean` flag accessible to the `exit` handler
- The flag lives on a `LifecycleState` injectable or similar shared service
- See also: [[adr/ADR001-stdio-transport]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | LSP lifecycle compliance | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/handlers/shutdown.handler.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-023]] — `exit` handler reads the `shutdownRequested` flag set here

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

Test must verify that the response result is exactly `null` and that the `shutdownRequested` flag is set to `true` after the handler runs.

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
