---
id: "TASK-053"
title: "Implement flavorGrenade/awaitIndexReady request"
type: task
status: open
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-049"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-053"]
---

# Implement flavorGrenade/awaitIndexReady request

> [!INFO] `TASK-053` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Implement the `flavorGrenade/awaitIndexReady` custom JSON-RPC request handler. BDD test clients send this request after the `initialized` notification and block until the server responds. The server holds the response until the initial vault scan (VaultScanner) completes, then replies. This mechanism prevents race conditions in integration and BDD tests where the test queries the index before the scan has finished.

---

## Implementation Notes

- Custom request method name: `flavorGrenade/awaitIndexReady`
- Server behaviour: if scan is already complete, respond immediately; otherwise queue the response and flush when `VaultScanner` signals readiness
- Implementation pattern: use a Promise or event emitter that `VaultScanner` resolves/emits on completion; the request handler awaits this signal before replying
- In single-file mode: respond immediately (no scan to wait for)
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Test synchronization requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `awaitIndexReady returns only after initial scan is complete` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/await-index-ready.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault scan lifecycle and readiness signaling |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-049]] — VaultScanner must exist to signal readiness

**Unblocks:**

- [[tickets/TASK-054]] — VaultModule registers this request handler

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
- [ ] Parent feature [[tickets/FEAT-005]] child task row updated to `in-review`

---

## Notes

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-005]].
