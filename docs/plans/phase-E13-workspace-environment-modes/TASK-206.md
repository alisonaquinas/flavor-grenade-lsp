---
id: "TASK-206"
title: "Block virtual workspace server startup"
type: task
status: done
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

> [!INFO] `TASK-206` - Task - Phase E13 - Parent: [[FEAT-031]] - Status: `done`

## Description

Add extension behavior that detects virtual workspaces before server startup.
Virtual workspaces must not spawn the bundled server because vault indexing
requires a real file system, and the user-facing status must explain that limit.

---

## Implementation Notes

- Detect VS Code virtual workspace state before language client startup.
- Share disabled-state rendering with Restricted Mode where practical.
- Keep the message specific to file-system requirements.
- See also: [[docs/features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Virtual workspaces have explicit no-spawn behavior | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Unsupported virtual workspace state is visible through status UI | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Virtual workspace disables server startup (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/workspace-environment.test.ts` | Unit | `Extension.Workspace.EnvironmentModes` | ✅ passing |
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | ✅ passing |

After implementation, update the rows above and the corresponding rows in [[docs/test/matrix]] and [[docs/test/index]].

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

- [x] Failing test or extension-host scenario written first.
- [x] Virtual workspaces prevent language client/server startup.
- [x] Disabled status identifies the file-system requirement.
- [x] `bun run lint --max-warnings 0` passes.
- [x] `tsc --noEmit` exits 0.
- [x] All linked BDD scenarios pass locally or have documented manual evidence.
- [x] [[docs/test/matrix]] row(s) updated to `✅ passing`.
- [x] [[docs/test/index]] row(s) added for new test files.
- [x] Parent feature [[FEAT-031]] child task row updated to `in-review`.

---

## Notes

This task covers virtual workspaces only. Remote file-system extension hosts are
handled by [[TASK-207]] and [[TASK-208]].

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[docs/requirements/technical/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-031]].

> [!WARNING] Red - 2026-05-07
> Added failing workspace environment tests requiring virtual workspaces to
> block server startup before binary resolution.

> [!SUCCESS] Green - 2026-05-07
> Added virtual workspace classification and disabled status wording for
> non-file workspace folders; extension tests pass.

> [!SUCCESS] In Review - 2026-05-07
> Definition of Done is satisfied locally; awaiting PR CI and review.

> [!SUCCESS] Done - 2026-05-07
> PR #45 CI is green and the parent feature row is updated to `done`.
