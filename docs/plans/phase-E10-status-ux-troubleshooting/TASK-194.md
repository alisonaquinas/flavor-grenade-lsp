---
id: "TASK-194"
title: "Add disabled error and crash status states"
type: task
status: open
priority: high
phase: E10
parent: "FEAT-028"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-193"]
tags: [tickets/task, "phase/E10"]
aliases: ["TASK-194"]
---

# Add disabled error and crash status states

> [!INFO] `TASK-194` - Task - Phase E10 - Parent: [[FEAT-028]] - Status: `open`

## Description

Add explicit status text and tooltip behavior for missing binary, crash
exhaustion, Restricted Mode, virtual workspaces, unsupported platforms, and
server error states. Each state must explain what happened and what the user can
do next.

---

## Implementation Notes

- Keep disabled states from spawning the server in unsupported environments
- Distinguish temporary server errors from crash-loop exhaustion
- Reuse the tooltip data model from [[TASK-193]]
- See also: [[features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Status bar represents lifecycle, disabled, error, and crash states | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Workspace.EnvironmentModes` | Restricted and virtual workspaces have explicit server-start behavior | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Restricted Mode shows disabled status and does not spawn the server (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Missing binary shows actionable status (planned scenario) |
| `docs/bdd/features/vscode-extension.feature` | Crash exhaustion is visible in the status bar |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | failing |
| `extension/src/test/suite/status-disabled-states.test.ts` | Integration | `Extension.Status.Diagnostics` | failing |

> After implementation, update the rows above and the corresponding rows in
> See [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Server binary resolution failures must be visible to users |

---

## Parent Feature

[[FEAT-028]] - Status UX And Troubleshooting

---

## Dependencies

**Blocked by:**

- [[TASK-193]] - status tooltip data model should exist first

**Unblocks:**

- [[TASK-195]] - quick actions depend on the final state set
- [[TASK-196]] - troubleshooting docs depend on final user-facing states

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Missing binary, crash exhaustion, Restricted Mode, virtual workspace, unsupported platform, and server error states are represented
- [ ] Disabled states do not start the server
- [ ] Each error or disabled state names at least one next action
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-028]] child task row updated to `in-review`

---

## Notes

Keep the state names stable enough for tests and troubleshooting docs to link
user-visible behavior to support actions.

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
> Ticket created. Status: `open`. Parent: [[FEAT-028]].
