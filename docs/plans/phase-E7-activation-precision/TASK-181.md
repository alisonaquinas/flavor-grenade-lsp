---
id: "TASK-181"
title: "Add Vault Marker Activation Events"
type: task
status: open
priority: high
phase: E7
parent: "FEAT-025"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/task, "phase/E7"]
aliases: ["TASK-181"]
---

# Add Vault Marker Activation Events

> [!INFO] `TASK-181` - Task - Phase E7 - Parent: [[FEAT-025]] - Status: `open`

## Description

Update the VS Code extension manifest so workspaces containing `.obsidian/` or
`.flavor-grenade.toml` wake the extension automatically. The marker events must
coexist with existing language and command activation events.

---

## Implementation Notes

- Add `workspaceContains:.obsidian` activation coverage
- Add `workspaceContains:.flavor-grenade.toml` activation coverage
- Preserve current `onLanguage:markdown`, `onLanguage:ofmarkdown`, and commands
- See also: [[plans/phase-E7-activation-precision]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.MarkerEvents` | Manifest reacts to vault markers, language files, and commands | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.VaultPrecision` | Vault-marker workspaces activate automatically | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Obsidian vault marker activates the extension (planned scenario) (planned scenario) |
| `bdd/features/vscode-extension-parity.feature` | Flavor Grenade marker activates the extension (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/activation-markers.test.ts` | Extension Host | `Extension.Activation.MarkerEvents` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Keep VS Code client behavior explicit and thin |

---

## Parent Feature

[[FEAT-025]] - Activation Precision And Startup Gating

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-182]] - startup gating depends on marker signal inventory

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing activation marker test is written first
- [ ] Extension manifest includes both vault marker activation events
- [ ] Existing language and command activation events remain registered
- [ ] `cd extension && npm run check-types` passes
- [ ] `cd extension && npm test` passes
- [ ] [[test/matrix]] and [[test/index]] updated for new coverage

---

## Notes

Do not introduce startup indexing behavior in this task. That belongs to
[[TASK-182]].

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-025]].
