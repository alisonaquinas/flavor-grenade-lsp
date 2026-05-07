---
id: "TASK-185"
title: "Register Native Reference And Link Bridges"
type: task
status: open
priority: high
phase: E8
parent: "FEAT-026"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-025"]
tags: [tickets/task, "phase/E8"]
aliases: ["TASK-185"]
---

# Register Native Reference And Link Bridges

> [!INFO] `TASK-185` - Task - Phase E8 - Parent: [[FEAT-026]] - Status: `open`

## Description

Register the core Marksman-style command bridges for references and link
following. Valid reference payloads should invoke `editor.action.showReferences`;
valid link payloads should invoke native VS Code location navigation.

---

## Implementation Notes

- Register `flavorGrenade.showReferences`
- Register `flavorGrenade.followLink`
- Use VS Code command APIs from the client extension only
- See also: [[plans/phase-E8-command-bridges-native-navigation]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.NativeUI` | Bridge server locations to native VS Code reference and navigation UI | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Required `flavorGrenade.*` commands are registered | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Show references bridge invokes native references UI (planned scenario) (planned scenario) |
| `bdd/features/vscode-extension-parity.feature` | Follow link bridge invokes native location navigation (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/command-bridges-native.test.ts` | Extension Host | `Extension.CommandBridges.NativeUI` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Native VS Code UI belongs in client command bridges |

---

## Parent Feature

[[FEAT-026]] - Command Bridges And Native Navigation

---

## Dependencies

**Blocked by:**

- [[FEAT-025]] - activation precision should be complete first

**Unblocks:**

- [[TASK-186]] - validation should cover the registered bridge shapes

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing native bridge tests are written first
- [ ] `flavorGrenade.showReferences` is contributed and registered
- [ ] `flavorGrenade.followLink` is contributed and registered
- [ ] Valid payloads call the expected native VS Code commands or APIs
- [ ] `cd extension && npm run check-types` passes
- [ ] `cd extension && npm test` passes
- [ ] [[test/matrix]] and [[test/index]] updated for new coverage

---

## Notes

Payload hardening belongs to [[TASK-186]]. This task establishes the bridge
surfaces and happy-path navigation.

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
> Ticket created. Status: `open`. Parent: [[FEAT-026]].
