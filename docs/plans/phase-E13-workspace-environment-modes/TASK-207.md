---
id: "TASK-207"
title: "Resolve server binary for local and remote hosts"
type: task
status: open
priority: medium
phase: E13
parent: "FEAT-031"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-205", "TASK-206"]
tags: [tickets/task, "phase/E13"]
aliases: ["TASK-207"]
---

# Resolve server binary for local and remote hosts

> [!INFO] `TASK-207` - Task - Phase E13 - Parent: [[FEAT-031]] - Status: `open`

## Description

Verify the extension resolves the bundled server binary for the extension host
where it is running. Local hosts and remote hosts must use the package target
that matches the files being indexed, not the user's desktop operating system.

---

## Implementation Notes

- Keep `extensionKind` behavior aligned with running next to workspace files.
- Validate platform and architecture mapping through the server-command path.
- Preserve developer custom-server override behavior.
- See also: [[ADR015-platform-specific-vsix]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Remote extension hosts run the correct bundled server where supported | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Remote extension host resolves matching bundled server (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/server-command.test.ts` | Unit | `Extension.Workspace.EnvironmentModes` | 🔴 failing |

After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR015-platform-specific-vsix]] | Platform-specific VSIXs bundle one matching server binary |

---

## Parent Feature

[[FEAT-031]] - Workspace Environment Modes

---

## Dependencies

**Blocked by:**

- [[TASK-205]] - Restricted Mode must block before binary resolution.
- [[TASK-206]] - virtual workspaces must block before binary resolution.

**Unblocks:**

- [[TASK-208]] - smoke-test documentation should describe the implemented
  resolution path.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test written first.
- [ ] Local Windows, macOS, and Linux mappings remain covered.
- [ ] Remote extension-host mapping is documented in code comments or tests.
- [ ] Custom server override remains supported for development.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-031]] child task row updated to `in-review`.

---

## Notes

The important behavior is host-relative binary selection. Do not add runtime
downloads in this task.

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
