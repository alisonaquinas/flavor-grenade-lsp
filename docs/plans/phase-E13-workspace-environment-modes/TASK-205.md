---
id: "TASK-205"
title: "Block Restricted Mode server startup"
type: task
status: in-review
priority: medium
phase: E13
parent: "FEAT-031"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/task, "phase/E13"]
aliases: ["TASK-205"]
---

# Block Restricted Mode server startup

> [!INFO] `TASK-205` - Task - Phase E13 - Parent: [[FEAT-031]] - Status: `in-review`

## Description

Add extension-host behavior that detects VS Code Restricted Mode before server
startup. When workspace trust is unavailable, the extension must avoid spawning
the bundled server and must expose a disabled status that explains why vault
indexing is unavailable.

---

## Implementation Notes

- Check VS Code workspace trust before constructing or starting the language
  client.
- Reuse the existing status surface for the disabled environment state.
- Preserve command behavior for safe commands such as showing output.
- See also: [[features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Restricted Mode has explicit no-spawn behavior | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Disabled state is visible through status UI | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Restricted Mode disables server startup (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/workspace-environment.test.ts` | Unit | `Extension.Workspace.EnvironmentModes` | ✅ passing |
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | ✅ passing |

After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR015-platform-specific-vsix]] | Bundled server binaries are selected from packaged platform assets |

---

## Parent Feature

[[FEAT-031]] - Workspace Environment Modes

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-207]] - server binary resolution can assume trust gating has already
  happened.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Failing test or extension-host scenario written first.
- [x] Restricted Mode prevents language client/server startup.
- [x] Disabled status identifies workspace trust as the reason.
- [x] `bun run lint --max-warnings 0` passes.
- [x] `tsc --noEmit` exits 0.
- [x] All linked BDD scenarios pass locally or have documented manual evidence.
- [x] [[test/matrix]] row(s) updated to `✅ passing`.
- [x] [[test/index]] row(s) added for new test files.
- [x] Parent feature [[FEAT-031]] child task row updated to `in-review`.

---

## Notes

This task should not add virtual-workspace handling; that is [[TASK-206]].

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
> Added failing workspace environment tests requiring Restricted Mode to block
> server startup before binary resolution.

> [!SUCCESS] Green - 2026-05-07
> Added `describeWorkspaceEnvironment` and wired activation disabled status to
> block Restricted Mode before server startup; extension tests pass.

> [!SUCCESS] In Review - 2026-05-07
> Definition of Done is satisfied locally; awaiting PR CI and review.
