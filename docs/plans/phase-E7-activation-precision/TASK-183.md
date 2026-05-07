---
id: "TASK-183"
title: "Preserve Command And Language Wake Paths"
type: task
status: green
priority: medium
phase: E7
parent: "FEAT-025"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-182"]
tags: [tickets/task, "phase/E7"]
aliases: ["TASK-183"]
---

# Preserve Command And Language Wake Paths

> [!INFO] `TASK-183` - Task - Phase E7 - Parent: [[FEAT-025]] - Status: `green`

## Description

Verify that explicit Flavor Grenade commands and supported language files still
wake the extension for late-open, single-file, and user-initiated workflows.
These paths must not bypass the startup gate added for generic Markdown.

---

## Implementation Notes

- Cover `onLanguage:markdown` and `onLanguage:ofmarkdown`
- Cover restart, rebuild-index, show-output, and activation commands
- Keep command activation intentional and observable
- See also: `extension/docs/plans/vscode-extension-parity.md`

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.MarkerEvents` | Language and command activation remain supported signals | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.VaultPrecision` | Explicit commands can wake without uncontrolled vault work | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Explicit command wakes the extension intentionally (planned scenario) (planned scenario) |
| `bdd/features/vscode-extension-parity.feature` | OFMarkdown language activation remains supported (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/activation-gate.test.ts` | Unit | `Extension.Activation.MarkerEvents` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | VS Code commands are client-owned activation surfaces |

---

## Parent Feature

[[FEAT-025]] - Activation Precision And Startup Gating

---

## Dependencies

**Blocked by:**

- [[TASK-182]] - wake paths must use the startup gate

**Unblocks:**

- [[TASK-184]] - docs need final active and idle behavior

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Failing command and language wake tests are written first
- [x] Supported language activation still wakes the extension
- [x] Explicit commands wake the extension intentionally
- [x] Wake paths do not start vault work without a positive signal
- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] [[test/matrix]] and [[test/index]] updated for new coverage

---

## Notes

This task protects single-file and late-open Markdown cases while keeping the
generic Markdown workspace idle path intact.

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
> Added failing command-wake startup check coverage in
> `extension/src/activation-gate.test.ts`.

> [!INFO] Green - 2026-05-07
> Preserved language and command wake signals through the lazy client start
> path and verified command wake coverage passes.
