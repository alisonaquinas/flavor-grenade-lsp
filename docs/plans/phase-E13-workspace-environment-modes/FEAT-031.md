---
id: "FEAT-031"
title: "Workspace Environment Modes"
type: feature
status: done
priority: medium
phase: E13
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/feature, "phase/E13"]
aliases: ["FEAT-031"]
---

# Workspace Environment Modes

> [!INFO] `FEAT-031` - Feature - Phase E13 - Priority: `medium` - Status: `done`

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
| `User.Extension.UnderstandServerState` | Understand when the server is disabled, unsupported, or ready in the current workspace | [[docs/requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Restricted, virtual, remote, WSL, SSH, and Dev Container workspaces have explicit server-start behavior and documentation | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Disabled and unsupported environment states are visible through status UI | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for activation, status, and workspace behavior |
| `docs/bdd/features/vscode-extension.feature` | VS Code extension behavior scenarios |

---

## Phase Plan Reference

- Phase plan: [[docs/plans/phase-E13-workspace-environment-modes]]
- Execution ledger row: [[docs/plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Restricted Mode shows disabled status and never spawns the server.
- [x] Virtual workspaces show disabled status and never spawn the server.
- [x] Local Windows, macOS, and Linux startup behavior is documented.
- [x] WSL, SSH, and Dev Container smoke-test procedures are documented.
- [x] Remote extension hosts resolve the matching platform server binary.
- [x] Status and troubleshooting docs agree on environment behavior.
- [x] [[docs/test/matrix]] updated with every new test file introduced.
- [x] [[docs/test/index]] updated with every new test file introduced.
- [x] Phase gate command passes locally; awaiting CI (see [[docs/plans/execution-ledger]]).
- [x] No new linter warnings introduced (`bun run lint --max-warnings 0`).
- [x] `tsc --noEmit` exits 0.

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-205]] | Block Restricted Mode server startup | `done` |
| [[TASK-206]] | Block virtual workspace server startup | `done` |
| [[TASK-207]] | Resolve server binary for local and remote hosts | `done` |
| [[TASK-208]] | Document remote environment smoke tests | `done` |
| [[CHORE-078]] | Phase E13 extension lint sweep | `done` |
| [[CHORE-079]] | Phase E13 manual verification ledger sweep | `done` |
| [[CHORE-080]] | Phase E13 troubleshooting trace sweep | `done` |

---

## Dependencies

**Blocked by:**

- Phase E12 (see [[docs/plans/execution-ledger]]) - OFMarkdown contribution work
  should be complete before environment behavior is finalized.

**Unblocks:**

- [[FEAT-032]] - membership refresh and compatibility guardrails rely on known
  local and remote environment behavior.

---

## Notes

This phase follows [[docs/features/vscode-extension-parity]] and
[[docs/research/marksman-vscode-feature-parity-ofmarkdown]] for the thin-client
extension boundary. Manual remote checks are expected where CI cannot create
the VS Code host mode.

---

## Lifecycle

Full state machine, entry and exit criteria, and agent obligations for each
state: [[docs/templates/tickets/lifecycle/feature-lifecycle]]

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

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E13 execution started on branch
> `codex/phase-e13-workspace-environments`. Child task tickets are present and
> scoped; implementation now follows the phase execution procedure.

> [!SUCCESS] In Review - 2026-05-07
> Workspace environment classifier, activation gating, remote/local smoke docs,
> troubleshooting docs, and traceability are locally verified. Awaiting PR CI
> and review.

> [!SUCCESS] Done - 2026-05-07
> PR #45 CI passed TypeScript typecheck, ESLint, Prettier format check, tests,
> Markdown lint, and build. Phase E13 is complete.

## Retrospective

> Written after Step L passes. Date: 2026-05-07.

### What went as planned

The phase worked best after moving the environment decision into a pure
classifier. That made trust, virtual workspace, local, and remote cases
testable without requiring real remote VS Code hosts.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | None | Existing activation code already had partial no-spawn behavior; E13 made it explicit and traceable | 0 h |

### Process observations

Manual remote verification belongs in documentation and trace rows, while
automated tests should cover the deterministic classifier rules.

### Carry-forward actions

- [ ] Reuse the classifier's platform summary in E14 compatibility diagnostics.

### Rule / template amendments

- [ ] None.
