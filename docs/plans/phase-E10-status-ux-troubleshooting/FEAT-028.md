---
id: "FEAT-028"
title: "Status UX And Troubleshooting"
type: feature
status: in-progress
priority: high
phase: E10
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-027"]
tags: [tickets/feature, "phase/E10"]
aliases: ["FEAT-028"]
---

# Status UX And Troubleshooting

> [!INFO] `FEAT-028` - Feature - Phase E10 - Priority: `high` - Status: `in-progress`

## Goal

Vault authors can read the Flavor Grenade status item as a compact health
surface. They can tell whether the server is starting, indexing, ready,
disabled, crashed, or misconfigured, and they can take the next recovery action
without searching raw logs first.

---

## Scope

**In scope:**

- Add status tooltip fields for server state, server version, extension version,
  active vault root, vault count, document count, and last error
- Represent missing binary, crash exhaustion, Restricted Mode, virtual
  workspaces, and unsupported platform states
- Add status quick actions for restart, rebuild index, show output, copy
  diagnostics, and reveal vault root
- Add troubleshooting documentation for common install and runtime failures

**Out of scope (explicitly excluded):**

- Remote workspace smoke execution
- Marketplace screenshots or GIF capture
- Custom tree views or activity-bar panels

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.UnderstandServerState` | Understand server state at a glance | [[requirements/user/vscode-extension-parity]] |
| `User.Extension.TrustExtensionBehavior` | Trust extension behavior across updates | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Status bar exposes actionable server, vault, and error state | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.QuickActions` | Status UI exposes recovery and support actions when applicable | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Diagnostic copy and vault reveal are registered extension actions | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for status diagnostics and quick actions |
| `docs/bdd/features/vscode-extension.feature` | Existing extension lifecycle and status scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E10-status-ux-troubleshooting]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Every known status state has accurate text and tooltip detail
- [ ] Disabled and error states expose useful next actions
- [ ] Diagnostic copy output excludes secrets and includes actionable platform data
- [ ] Status quick actions include restart, rebuild index, output, diagnostics, and vault reveal
- [ ] Troubleshooting docs cover missing binary, crash loop, no OFMarkdown promotion, no completions, and stale index
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-193]] | Model rich status tooltip data | `open` |
| [[TASK-194]] | Add disabled error and crash status states | `open` |
| [[TASK-195]] | Add status quick actions and diagnostic copy | `open` |
| [[TASK-196]] | Add troubleshooting docs and command flow | `open` |
| [[CHORE-069]] | Phase E10 Lint And Typecheck Sweep | `open` |
| [[CHORE-070]] | Phase E10 Test Matrix Sweep | `open` |
| [[CHORE-071]] | Phase E10 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[FEAT-027]] - Phase E9 host harness should cover status states before UX changes
- Phase E9 (see [[plans/execution-ledger]]) - Status tests provide the regression surface

**Unblocks:**

- Phase E11 - Marketplace proof can show richer status behavior
- Phase E13 - Workspace environment modes can reuse disabled status patterns

---

## Notes

Implementation sequence: [[TASK-193]] and [[TASK-194]] define state and tooltip
behavior, [[TASK-195]] adds recovery actions, then [[TASK-196]] documents support
flows. Run [[CHORE-069]], [[CHORE-070]], and [[CHORE-071]] after behavior settles.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to
> complete the spec and create all child `TASK-NNN` tickets before transitioning
> to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E10 execution started on branch `codex/phase-e10-status-ux`.
