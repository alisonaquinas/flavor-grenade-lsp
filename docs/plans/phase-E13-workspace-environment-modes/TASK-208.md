---
id: "TASK-208"
title: "Document remote environment smoke tests"
type: task
status: open
priority: medium
phase: E13
parent: "FEAT-031"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-206", "TASK-207"]
tags: [tickets/task, "phase/E13"]
aliases: ["TASK-208"]
---

# Document remote environment smoke tests

> [!INFO] `TASK-208` - Task - Phase E13 - Parent: [[FEAT-031]] - Status: `open`

## Description

Add the manual verification path for local Windows, macOS, Linux, WSL, SSH, and
Dev Container environments. The documentation must state what starts, what stays
disabled, what status appears, and what evidence closes the phase gate.

---

## Implementation Notes

- Keep smoke-test steps in extension-facing docs and link them from phase docs.
- Include Restricted Mode and virtual workspace expected results.
- Capture when manual evidence is acceptable because CI cannot create the host.
- See also: [[plans/phase-E13-workspace-environment-modes]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Environment modes have documented tested or manually verified behavior | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Troubleshooting language matches disabled and unsupported statuses | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Workspace environment smoke tests are documented (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/docs/plans/vscode-extension-parity.md` | Manual | `Extension.Workspace.EnvironmentModes` | 🔴 failing |

After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR015-platform-specific-vsix]] | Smoke tests must confirm target-specific bundled binaries |

---

## Parent Feature

[[FEAT-031]] - Workspace Environment Modes

---

## Dependencies

**Blocked by:**

- [[TASK-206]] - virtual workspace behavior must be known before documenting it.
- [[TASK-207]] - remote binary resolution must be known before documenting it.

**Unblocks:**

- [[CHORE-079]] - manual verification ledger sweep depends on final smoke-test
  wording.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Local Windows, macOS, and Linux smoke-test steps are documented.
- [ ] WSL, SSH, and Dev Container smoke-test steps are documented.
- [ ] Restricted Mode and virtual workspace disabled expectations are documented.
- [ ] Manual evidence format is documented for phase closeout.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new manual verification entries.
- [ ] Parent feature [[FEAT-031]] child task row updated to `in-review`.

---

## Notes

This ticket may update extension docs during implementation, but this ticket
generation pass only creates the assigned Phase E13 ticket files.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-031]].
