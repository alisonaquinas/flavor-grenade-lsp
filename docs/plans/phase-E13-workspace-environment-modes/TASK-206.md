---
id: "TASK-206"
title: "Block virtual workspace server startup"
type: task
status: red
priority: medium
phase: E13
parent: "FEAT-031"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/task, "phase/E13"]
aliases: ["TASK-206"]
---

# Block virtual workspace server startup

> [!INFO] `TASK-206` - Task - Phase E13 - Parent: [[FEAT-031]] - Status: `red`

## Description

Add extension behavior that detects virtual workspaces before server startup.
Virtual workspaces must not spawn the bundled server because vault indexing
requires a real file system, and the user-facing status must explain that limit.

---

## Implementation Notes

- Detect VS Code virtual workspace state before language client startup.
- Share disabled-state rendering with Restricted Mode where practical.
- Keep the message specific to file-system requirements.
- See also: [[features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Virtual workspaces have explicit no-spawn behavior | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Unsupported virtual workspace state is visible through status UI | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Virtual workspace disables server startup (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/extension.test.ts` | Extension-host | `Extension.Workspace.EnvironmentModes` | 🔴 failing |
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | 🔴 failing |

After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR015-platform-specific-vsix]] | Bundled server binaries require a supported file-system environment |

---

## Parent Feature

[[FEAT-031]] - Workspace Environment Modes

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-208]] - documentation can refer to implemented virtual-workspace
  behavior.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test or extension-host scenario written first.
- [ ] Virtual workspaces prevent language client/server startup.
- [ ] Disabled status identifies the file-system requirement.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] All linked BDD scenarios pass locally or have documented manual evidence.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-031]] child task row updated to `in-review`.

---

## Notes

This task covers virtual workspaces only. Remote file-system extension hosts are
handled by [[TASK-207]] and [[TASK-208]].

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

> [!WARNING] Red - 2026-05-07
> Added failing workspace environment tests requiring virtual workspaces to
> block server startup before binary resolution.
