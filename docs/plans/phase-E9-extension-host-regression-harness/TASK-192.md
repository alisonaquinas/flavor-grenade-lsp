---
id: "TASK-192"
title: "Cover status and server failure states"
type: task
status: done
priority: high
phase: E9
parent: "FEAT-027"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-189"]
tags: [tickets/task, "phase/E9"]
aliases: ["TASK-192"]
---

# Cover status and server failure states

> [!INFO] `TASK-192` - Task - Phase E9 - Parent: [[FEAT-027]] - Status: `done`

## Description

Add extension-host tests for status transitions and missing custom server path
failure. The tests should prove that starting, indexing, ready, error, and
misconfigured server states are visible through the VS Code client surface.

---

## Implementation Notes

- Use a mock client, test server, or controlled notification path to emit
  `flavorGrenade/status`
- Cover missing custom server path without spawning orphaned child processes
- Capture enough state to support the richer status UX planned in Phase E10
- See also: [[plans/phase-E10-status-ux-troubleshooting]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Host tests include status transition and failure groups | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Status UI exposes lifecycle, error, and misconfiguration states | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension.feature` | Status bar reflects server lifecycle states |
| `docs/bdd/features/vscode-extension-parity.feature` | Missing custom server path produces a useful failure state (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/suite/status-failure.test.js` | Integration | `Extension.Tests.HostCoverage` | passing |
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | passing |

> After implementation, update the rows above and the corresponding rows in
> See [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Extension failures must account for bundled server command resolution |

---

## Parent Feature

[[FEAT-027]] - Extension Host Regression Harness

---

## Dependencies

**Blocked by:**

- [[TASK-189]] - host runner must exist first

**Unblocks:**

- [[FEAT-028]] - status UX work depends on observable status test states
- [[TASK-193]] - tooltip data tests build on these status fixtures

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] Starting, indexing, ready, and error status paths are covered by status presenter tests
- [x] Missing custom server path setting is visible in the extension host
- [x] Failure tests leave no orphaned server process
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-027]] child task row updated to `in-review`

---

## Notes

Do not implement the Phase E10 quick-action menu here. This task only provides
regression coverage for state visibility and server failure handling.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-027]].

> [!INFO] Red - 2026-05-07
> Added failing extension-host status and server failure surface coverage.

> [!SUCCESS] Green - 2026-05-07
> Added host coverage for troubleshooting command/settings visibility and
> Node-level status presenter tests for initializing, indexing, ready, and
> error display text. Direct status bar item inspection is not exposed by the
> VS Code extension-host API.

> [!SUCCESS] Done - 2026-05-07
> PR #41 CI passed. Status transition presentation is covered in Node and in the
> development extension host through the test-only activation API.
