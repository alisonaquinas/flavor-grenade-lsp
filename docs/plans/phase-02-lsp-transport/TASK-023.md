---
id: "TASK-023"
title: "Handle exit notification"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-022"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-023"]
---

# Handle exit notification

> [!INFO] `TASK-023` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Implement the `exit` notification handler. Per the LSP specification the server must call `process.exit(0)` if the `shutdown` request was received prior to `exit`, and `process.exit(1)` otherwise. The handler reads the `shutdownRequested` flag set by the `shutdown` handler and branches accordingly. This is the final step in the LSP server lifecycle.

---

## Implementation Notes

- Read `shutdownRequested` from the shared `LifecycleState` injectable (created in TASK-022)
- If `shutdownRequested === true`: `process.exit(0)`
- If `shutdownRequested === false`: `process.exit(1)`
- No response is sent (notification)
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
| `tests/unit/lsp/handlers/exit.handler.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-022]] — `shutdownRequested` flag is set by the shutdown handler

**Unblocks:**

- [[tickets/TASK-029]] — Integration tests exercise the full shutdown → exit sequence

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

Unit tests should mock `process.exit` and assert the correct code (0 vs 1) depending on the `shutdownRequested` flag state.

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
