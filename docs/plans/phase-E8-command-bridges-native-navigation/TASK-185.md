---
id: "TASK-185"
title: "Register Native Reference And Link Bridges"
type: task
status: done
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

> [!INFO] `TASK-185` - Task - Phase E8 - Parent: [[FEAT-026]] - Status: `done`

## Description

Register the core Marksman-style command bridges for references and link
following. Valid reference payloads should invoke `editor.action.showReferences`;
valid link payloads should invoke native VS Code location navigation.

---

## Implementation Notes

- Register `flavorGrenade.showReferences`
- Register `flavorGrenade.followLink`
- Use VS Code command APIs from the client extension only
- See also: [[docs/plans/phase-E8-command-bridges-native-navigation]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.NativeUI` | Bridge server locations to native VS Code reference and navigation UI | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Required `flavorGrenade.*` commands are registered | [[docs/requirements/functional/vscode-extension-parity]] |

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
| `extension/src/command-bridges.test.ts` | Unit | `Extension.CommandBridges.NativeUI` | ✅ passing |

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

- [x] Failing native bridge tests are written first
- [x] `flavorGrenade.showReferences` is contributed and registered
- [x] `flavorGrenade.followLink` is contributed and registered
- [x] Valid payloads call the expected native VS Code commands or APIs
- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] [[docs/test/matrix]] and [[docs/test/index]] updated for new coverage

---

## Notes

Payload hardening belongs to [[TASK-186]]. This task establishes the bridge
surfaces and happy-path navigation.

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
> Ticket created. Status: `open`. Parent: [[FEAT-026]].

> [!INFO] Red - 2026-05-07
> Added failing native reference and link bridge tests in
> `extension/src/command-bridges.test.ts`.

> [!INFO] Green - 2026-05-07
> Registered native reference and link bridge commands, validated happy-path
> native calls, and verified the extension unit tests pass.

> [!INFO] In Review - 2026-05-07
> Local phase gate passed and native bridge coverage is ready for PR review.

> [!SUCCESS] Done - 2026-05-07
> PR #40 CI passed; native reference and link bridge work is complete.
