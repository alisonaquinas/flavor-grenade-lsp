---
id: "FEAT-025"
title: "Activation Precision And Startup Gating"
type: feature
status: in-progress
priority: high
phase: E7
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/feature, "phase/E7"]
aliases: ["FEAT-025"]
---

# Activation Precision And Startup Gating

> [!INFO] `FEAT-025` - Feature - Phase E7 - Priority: `high` - Status: `in-progress`

## Goal

Vault authors get automatic Flavor Grenade support when VS Code opens an
Obsidian or Flavor Grenade vault, while ordinary Markdown workspaces stay quiet.
Explicit user commands and supported language files can still wake the
extension when the user intends to use it.

---

## Scope

**In scope:**

- Add vault marker activation for `.obsidian/` and `.flavor-grenade.toml`
- Keep `markdown`, `ofmarkdown`, and command activation paths intentional
- Gate expensive vault membership and indexing work behind a positive signal
- Expose an idle state for generic Markdown workspaces
- Update extension activation docs and README wording

**Out of scope (explicitly excluded):**

- Command bridges and native navigation
- New custom tree views, activity-bar views, or Marketplace screenshots
- Remote, virtual, and restricted workspace policy changes beyond gating

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| `User.Extension.StartOnlyForVaults` | Start automatically for vaults without invading generic Markdown workspaces | [[requirements/user/vscode-extension-parity]] |

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.VaultPrecision` | Vault workspaces activate while generic Markdown remains idle | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.MarkerEvents` | Manifest and controller honor marker, language, and command signals | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Extension parity scenarios for activation precision |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E7-activation-precision]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `.obsidian/` workspaces activate and start membership detection
- [ ] `.flavor-grenade.toml` workspaces activate and start membership detection
- [ ] Generic Markdown workspaces remain idle until a positive signal appears
- [ ] Explicit commands can wake the extension without bypassing startup checks
- [ ] `onLanguage:markdown` and `onLanguage:ofmarkdown` remain supported
- [ ] Extension docs describe active, idle, and command-wake behavior
- [ ] Phase gate commands pass under `extension/`
- [ ] [[test/matrix]] and [[test/index]] reflect new coverage

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-181]] | Add Vault Marker Activation Events | `red` |
| [[TASK-182]] | Gate Startup Vault Work | `red` |
| [[TASK-183]] | Preserve Command And Language Wake Paths | `red` |
| [[TASK-184]] | Document Activation Behavior | `open` |
| [[CHORE-060]] | Phase E7 Lint Sweep | `open` |
| [[CHORE-061]] | Phase E7 Test Trace Sweep | `open` |
| [[CHORE-062]] | Phase E7 Documentation Trace Sweep | `open` |

---

## Dependencies

**Blocked by:**

- Phase E6 - previous extension parity slice should be complete

**Unblocks:**

- [[FEAT-026]] - command bridge work assumes intentional extension startup

---

## Notes

This feature follows the activation precision slice in
[[research/marksman-vscode-feature-parity-ofmarkdown]] and
`extension/docs/plans/vscode-extension-parity.md`.

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
> current state whenever adding an entry.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!INFO] Started - 2026-05-07
> Phase E7 execution started on branch `codex/phase-e7-activation-precision`.
