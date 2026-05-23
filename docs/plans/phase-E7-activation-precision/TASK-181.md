---
id: "TASK-181"
title: "Add Vault Marker Activation Events"
type: task
status: done
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

> [!INFO] `TASK-181` - Task - Phase E7 - Parent: [[FEAT-025]] - Status: `done`

## Description

Update the VS Code extension manifest so workspaces containing `.obsidian/` or
`.flavor-grenade.toml` wake the extension automatically. The marker events must
coexist with existing language and command activation events.

---

## Implementation Notes

- Add `workspaceContains:.obsidian` activation coverage
- Add `workspaceContains:.flavor-grenade.toml` activation coverage
- Preserve current `onLanguage:markdown`, `onLanguage:ofmarkdown`, and commands
- See also: [[docs/plans/phase-E7-activation-precision]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.MarkerEvents` | Manifest reacts to vault markers, language files, and commands | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.VaultPrecision` | Vault-marker workspaces activate automatically | [[docs/requirements/functional/vscode-extension-parity]] |

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
| `extension/src/activation-gate.test.ts` | Unit | `Extension.Activation.MarkerEvents` | ✅ passing |

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

- [x] Failing activation marker test is written first
- [x] Extension manifest includes both vault marker activation events
- [x] Existing language and command activation events remain registered
- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] [[docs/test/matrix]] and [[docs/test/index]] updated for new coverage

---

## Notes

Do not introduce startup indexing behavior in this task. That belongs to
[[TASK-182]].

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-025]].

> [!INFO] Red - 2026-05-07
> Added failing activation manifest and marker-detection tests in
> `extension/src/activation-gate.test.ts`.

> [!INFO] Green - 2026-05-07
> Added manifest marker and command activation events, implemented marker
> detection, and verified the extension unit tests pass.

> [!INFO] In Review - 2026-05-07
> Local phase gate passed and activation marker coverage is ready for PR review.

> [!SUCCESS] Done - 2026-05-07
> PR #39 CI passed; activation marker work is complete.
