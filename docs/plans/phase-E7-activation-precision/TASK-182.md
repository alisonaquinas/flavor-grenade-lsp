---
id: "TASK-182"
title: "Gate Startup Vault Work"
type: task
status: red
priority: high
phase: E7
parent: "FEAT-025"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-181"]
tags: [tickets/task, "phase/E7"]
aliases: ["TASK-182"]
---

# Gate Startup Vault Work

> [!INFO] `TASK-182` - Task - Phase E7 - Parent: [[FEAT-025]] - Status: `red`

## Description

Add startup gating so activation alone does not immediately perform expensive
vault membership or indexing work in generic Markdown workspaces. The extension
should enter active vault behavior only after a positive vault signal exists.

---

## Implementation Notes

- Treat `.obsidian/` and `.flavor-grenade.toml` as positive vault signals
- Keep generic Markdown startup in an idle state
- Ensure command wake paths still run the same startup checks
- See also: [[features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.VaultPrecision` | Generic Markdown startup must not perform vault indexing | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.MarkerEvents` | Controller maps activation signals to active or idle states | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Generic Markdown workspace remains idle (planned scenario) (planned scenario) |
| `bdd/features/vscode-extension-parity.feature` | Vault marker starts membership detection (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/startup-gating.test.ts` | Extension Host | `Extension.Activation.VaultPrecision` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Client starts work only from explicit VS Code signals |

---

## Parent Feature

[[FEAT-025]] - Activation Precision And Startup Gating

---

## Dependencies

**Blocked by:**

- [[TASK-181]] - marker activation events define positive startup signals

**Unblocks:**

- [[TASK-183]] - command and language wake paths must respect the gate

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing startup gating test is written first
- [ ] Generic Markdown workspaces stay idle without vault markers
- [ ] Vault-marker workspaces start membership detection
- [ ] Command wake paths reuse the startup gate
- [ ] `cd extension && npm run check-types` passes
- [ ] `cd extension && npm test` passes
- [ ] [[test/matrix]] and [[test/index]] updated for new coverage

---

## Notes

This task should avoid changing remote, virtual, or restricted workspace policy
except where the existing startup path already handles those states.

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

> [!INFO] Red - 2026-05-07
> Added failing startup-gate tests for generic Markdown idle and vault-marker
> startup in `extension/src/activation-gate.test.ts`.
