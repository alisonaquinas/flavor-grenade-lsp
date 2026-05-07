---
id: "TASK-188"
title: "Document Command Bridge Contracts"
type: task
status: open
priority: medium
phase: E8
parent: "FEAT-026"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-185", "TASK-186", "TASK-187"]
tags: [tickets/task, "phase/E8"]
aliases: ["TASK-188"]
---

# Document Command Bridge Contracts

> [!INFO] `TASK-188` - Task - Phase E8 - Parent: [[FEAT-026]] - Status: `open`

## Description

Document the command bridge names, payload ownership, validation behavior, and
native VS Code surfaces used by Phase E8. The docs should make clear that the
server provides intelligence while the extension adapts safe payloads.

---

## Implementation Notes

- List every required `flavorGrenade.*` bridge command
- Describe JSON-serializable payload expectations
- Document safe failure behavior for invalid payloads
- See also: [[plans/phase-E8-command-bridges-native-navigation]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.NativeUI` | Docs identify native VS Code UI surfaces | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.PayloadValidation` | Docs describe validation and safe failure behavior | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Docs list required graph action commands | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Command bridge contracts are documented (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/docs/README.md` | Manual Docs Review | `Extension.CommandBridges.GraphActions` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Command bridge contracts are client-owned and documented |

---

## Parent Feature

[[FEAT-026]] - Command Bridges And Native Navigation

---

## Dependencies

**Blocked by:**

- [[TASK-185]] - core bridge names must be final
- [[TASK-186]] - validation behavior must be final
- [[TASK-187]] - graph action bridge names must be final

**Unblocks:**

- [[CHORE-065]] - documentation trace sweep checks final command docs

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Docs list all Phase E8 bridge command names
- [ ] Docs describe payload validation and safe failure behavior
- [ ] Docs state that VS Code APIs stay in the client extension
- [ ] Docs link back to Phase E8 and extension parity requirements
- [ ] Markdown lint passes for changed docs
- [ ] [[test/matrix]] and [[test/index]] updated if needed

---

## Notes

This task is documentation-only. Behavior changes belong to [[TASK-185]],
[[TASK-186]], or [[TASK-187]].

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
