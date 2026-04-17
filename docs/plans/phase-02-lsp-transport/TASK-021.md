---
id: "TASK-021"
title: "Handle initialized notification"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-020"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-021"]
---

# Handle initialized notification

> [!INFO] `TASK-021` · Task · Phase 2 · Parent: [[tickets/FEAT-003]] · Status: `open`

## Description

Create the `initialized` notification handler. Per the LSP specification the client sends `initialized` immediately after receiving the `InitializeResult`, signalling that the client is ready for the server to begin active work. In Phase 2 the handler logs receipt and no-ops; Phase 4 will extend it to trigger vault detection and initial indexing. Registering the handler in Phase 2 ensures the dispatcher does not return a Method Not Found error for this notification.

---

## Implementation Notes

- Handler is a notification (no `id`, no response sent)
- Log receipt to `process.stderr` at debug level
- No-op body for Phase 2; leave a `// Phase 4: trigger vault detection` comment as a marker
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
| `tests/unit/lsp/handlers/initialized.handler.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-020]] — `initialize` handler must be in place before `initialized` handler is useful

**Unblocks:**

- [[tickets/TASK-029]] — Integration tests require all lifecycle handlers to be registered

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

The test should verify that the handler is registered (dispatcher does not error) and that it does not send any response message.

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
