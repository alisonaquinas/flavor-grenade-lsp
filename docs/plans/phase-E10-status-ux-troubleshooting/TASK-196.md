---
id: "TASK-196"
title: "Add troubleshooting docs and command flow"
type: task
status: open
priority: medium
phase: E10
parent: "FEAT-028"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-194", "TASK-195"]
tags: [tickets/task, "phase/E10"]
aliases: ["TASK-196"]
---

# Add troubleshooting docs and command flow

> [!INFO] `TASK-196` - Task - Phase E10 - Parent: [[FEAT-028]] - Status: `open`

## Description

Add troubleshooting documentation and, if needed, a command path that opens it
from VS Code. The docs must cover common install and runtime failures with
recovery steps that match the final status states and quick actions.

---

## Implementation Notes

- Cover binary missing, crash loop, no OFMarkdown promotion, no completions,
  stale index, Restricted Mode, and virtual workspace cases
- Link users to copy diagnostic info before asking for support details
- Keep recovery steps concise and aligned with actual command names
- See also: [[plans/phase-E10-status-ux-troubleshooting]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Troubleshooting docs explain visible status and error states | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.QuickActions` | Troubleshooting docs point to applicable recovery actions | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Troubleshooting command opens status recovery documentation (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Diagnostic copy supports troubleshooting common failures (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/troubleshooting.test.ts` | Unit | `Extension.Status.QuickActions` | failing |
| `extension/src/test/suite/troubleshooting-command.test.ts` | Integration | `Extension.Status.Diagnostics` | failing |

> After implementation, update the rows above and the corresponding rows in
> See [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR019-vscode-command-bridges-and-client-ux]] | User recovery should use native VS Code command surfaces |

---

## Parent Feature

[[FEAT-028]] - Status UX And Troubleshooting

---

## Dependencies

**Blocked by:**

- [[TASK-194]] - final disabled and error state names must be known
- [[TASK-195]] - final quick actions and diagnostic command names must be known

**Unblocks:**

- [[CHORE-071]] - documentation trace sweep can verify final support links

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Troubleshooting docs cover missing binary, crash loop, no OFMarkdown promotion, no completions, stale index, Restricted Mode, and virtual workspace cases
- [ ] Any troubleshooting command opens the documented recovery path
- [ ] Docs reference final command names and diagnostic copy behavior
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-028]] child task row updated to `in-review`

---

## Notes

If a troubleshooting command is already present, update it rather than adding a
second support entry point.

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
