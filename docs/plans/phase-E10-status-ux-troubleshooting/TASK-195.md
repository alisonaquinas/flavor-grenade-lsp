---
id: "TASK-195"
title: "Add status quick actions and diagnostic copy"
type: task
status: green
priority: high
phase: E10
parent: "FEAT-028"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-193", "TASK-194"]
tags: [tickets/task, "phase/E10"]
aliases: ["TASK-195"]
---

# Add status quick actions and diagnostic copy

> [!INFO] `TASK-195` - Task - Phase E10 - Parent: [[FEAT-028]] - Status: `green`

## Description

Add the status quick-action flow and `flavorGrenade.copyDiagnosticInfo` command.
Users should be able to restart the server, rebuild the index, show output, copy
safe diagnostics, and reveal the active vault root from the status surface when
those actions apply.

---

## Implementation Notes

- Hide or disable actions that do not apply to the current state
- Reuse sanitized status fields from [[TASK-193]] for diagnostic copy output
- Include extension version, server version when known, platform, server path
  summary, vault count, document count, and last error
- See also: [[docs/requirements/user/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.QuickActions` | Status UI exposes restart, rebuild, output, copy diagnostics, and reveal actions | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Diagnostic copy and vault reveal actions are registered command bridges | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Diagnostic copy uses actionable version and platform data | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Status quick actions expose applicable recovery commands (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Copy diagnostic info omits secrets and includes support data (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/status-actions.test.ts` | Unit | `Extension.Status.QuickActions` | failing |
| `extension/src/test/suite/status-actions.test.ts` | Integration | `Extension.Status.QuickActions` | failing |

> After implementation, update the rows above and the corresponding rows in
> See [[docs/test/matrix]] and [[docs/test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]] | Native VS Code commands remain the client-side bridge surface |

---

## Parent Feature

[[FEAT-028]] - Status UX And Troubleshooting

---

## Dependencies

**Blocked by:**

- [[TASK-193]] - tooltip and diagnostic fields must exist
- [[TASK-194]] - status state set must be final

**Unblocks:**

- [[TASK-196]] - troubleshooting docs depend on final command names and actions

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] Restart, rebuild index, show output, copy diagnostics, and reveal vault root actions are reachable when applicable
- [x] Unavailable actions are hidden or safely disabled
- [x] Diagnostic copy output omits secrets and includes useful support data
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[docs/test/matrix]] row(s) updated to `passing`
- [ ] [[docs/test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-028]] child task row updated to `in-review`

---

## Notes

This task may use a command palette flow, quick-pick menu, or status item command
as long as all required actions are discoverable and testable.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-028]].

> [!INFO] Red - 2026-05-07
> Added failing unit and host coverage for status quick actions and diagnostic
> copy data.

> [!SUCCESS] Green - 2026-05-07
> Added `flavorGrenade.showStatusActions`, status quick-action modeling, and
> extension-generated sanitized diagnostics. Host coverage passes across all
> fixtures.
