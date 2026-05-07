---
id: "TASK-186"
title: "Validate Command Bridge Payloads"
type: task
status: open
priority: high
phase: E8
parent: "FEAT-026"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-185"]
tags: [tickets/task, "phase/E8"]
aliases: ["TASK-186"]
---

# Validate Command Bridge Payloads

> [!INFO] `TASK-186` - Task - Phase E8 - Parent: [[FEAT-026]] - Status: `open`

## Description

Add shared validation for command bridge payloads before any VS Code API call is
made. Malformed, missing, or non-serializable payload data should fail safely
with no uncaught extension-host exception.

---

## Implementation Notes

- Validate URI-bearing payloads before converting to VS Code objects
- Validate location arrays before reference UI calls
- Keep payload contracts plain JSON across the LanguageClient boundary
- See also: [[requirements/user/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.PayloadValidation` | Bridge payloads must be validated before API calls | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.NativeUI` | Valid payloads still reach native VS Code UI | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Invalid bridge payload fails safely (planned scenario) (planned scenario) |
| `bdd/features/vscode-extension-parity.feature` | Valid bridge payload invokes expected native UI (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/command-bridge-payloads.test.ts` | Extension Host | `Extension.CommandBridges.PayloadValidation` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Payloads crossing client boundaries stay JSON-serializable |

---

## Parent Feature

[[FEAT-026]] - Command Bridges And Native Navigation

---

## Dependencies

**Blocked by:**

- [[TASK-185]] - native reference and link bridge shapes should exist

**Unblocks:**

- [[TASK-187]] - graph action bridges should reuse shared validation

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing valid and invalid payload tests are written first
- [ ] Reference payload validation rejects malformed locations
- [ ] URI payload validation rejects malformed or unsupported URI data
- [ ] Invalid payloads produce safe failure behavior
- [ ] `cd extension && npm run check-types` passes
- [ ] `cd extension && npm test` passes
- [ ] [[test/matrix]] and [[test/index]] updated for new coverage

---

## Notes

Safe failure may be a user-visible error or a no-op, but it must not be an
uncaught extension-host exception.

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
