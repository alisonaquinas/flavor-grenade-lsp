---
id: "FEAT-031"
title: "Workspace Environment Modes"
type: feature
status: in-progress
priority: medium
phase: E13
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/feature, "phase/E13"]
aliases: ["FEAT-031"]
---

# Workspace Environment Modes

> [!INFO] `FEAT-031` - Feature - Phase E13 - Priority: `medium` - Status: `in-progress`

## Goal

Vault authors get predictable VS Code behavior in trusted local workspaces,
Restricted Mode, virtual workspaces, WSL, SSH, Dev Containers, and other remote
extension hosts. Unsupported environments stay disabled with clear status
messages, while supported environments run the bundled server next to the files.

---

## Scope

**In scope:**

- Block server startup in Restricted Mode and virtual workspaces before process
  spawn.
- Verify local and remote extension hosts choose the correct platform-specific
  bundled server binary.
- Document WSL, SSH, Dev Container, and local operating-system smoke tests.
- Keep status UI and troubleshooting language aligned with environment support.

**Out of scope (explicitly excluded):**

- Web extension support.
- Runtime server binary download fallback.
- Remote vault protocols over HTTP.

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.UnderstandServerState` | Understand when the server is disabled, unsupported, or ready in the current workspace | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Restricted, virtual, remote, WSL, SSH, and Dev Container workspaces have explicit server-start behavior and documentation | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Disabled and unsupported environment states are visible through status UI | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for activation, status, and workspace behavior |
| `docs/bdd/features/vscode-extension.feature` | VS Code extension behavior scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E13-workspace-environment-modes]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Restricted Mode shows disabled status and never spawns the server.
- [ ] Virtual workspaces show disabled status and never spawn the server.
- [ ] Local Windows, macOS, and Linux startup behavior is documented.
- [ ] WSL, SSH, and Dev Container smoke-test procedures are documented.
- [ ] Remote extension hosts resolve the matching platform server binary.
- [ ] Status and troubleshooting docs agree on environment behavior.
- [ ] [[test/matrix]] updated with every new test file introduced.
- [ ] [[test/index]] updated with every new test file introduced.
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]]).
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`).
- [ ] `tsc --noEmit` exits 0.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-205]] | Block Restricted Mode server startup | `red` |
| [[TASK-206]] | Block virtual workspace server startup | `red` |
| [[TASK-207]] | Resolve server binary for local and remote hosts | `red` |
| [[TASK-208]] | Document remote environment smoke tests | `red` |
| [[CHORE-078]] | Phase E13 extension lint sweep | `open` |
| [[CHORE-079]] | Phase E13 manual verification ledger sweep | `open` |
| [[CHORE-080]] | Phase E13 troubleshooting trace sweep | `open` |

---

## Dependencies

**Blocked by:**

- Phase E12 (see [[plans/execution-ledger]]) - OFMarkdown contribution work
  should be complete before environment behavior is finalized.

**Unblocks:**

- [[FEAT-032]] - membership refresh and compatibility guardrails rely on known
  local and remote environment behavior.

---

## Notes

This phase follows [[features/vscode-extension-parity]] and
[[research/marksman-vscode-feature-parity-ofmarkdown]] for the thin-client
extension boundary. Manual remote checks are expected where CI cannot create
the VS Code host mode.

---

## Lifecycle

Full state machine, entry and exit criteria, and agent obligations for each
state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | - |
| `blocked` | All active tasks blocked | Blocker resolved -> back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI and review | CI green and human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E13 execution started on branch
> `codex/phase-e13-workspace-environments`. Child task tickets are present and
> scoped; implementation now follows the phase execution procedure.
