---
id: "TASK-186"
title: "Validate Command Bridge Payloads"
type: task
status: done
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

> [!INFO] `TASK-186` - Task - Phase E8 - Parent: [[FEAT-026]] - Status: `done`

## Description

Add shared validation for command bridge payloads before any VS Code API call is
made. Malformed, missing, or non-serializable payload data should fail safely
with no uncaught extension-host exception.

---

## Implementation Notes

- Validate URI-bearing payloads before converting to VS Code objects
- Validate location arrays before reference UI calls
- Keep payload contracts plain JSON across the LanguageClient boundary
- See also: [[docs/requirements/user/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.PayloadValidation` | Bridge payloads must be validated before API calls | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.NativeUI` | Valid payloads still reach native VS Code UI | [[docs/requirements/functional/vscode-extension-parity]] |

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
| `extension/src/command-bridges.test.ts` | Unit | `Extension.CommandBridges.PayloadValidation` | ✅ passing |

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

- [x] Failing valid and invalid payload tests are written first
- [x] Reference payload validation rejects malformed locations
- [x] URI payload validation rejects malformed or unsupported URI data
- [x] Invalid payloads produce safe failure behavior
- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] [[docs/test/matrix]] and [[docs/test/index]] updated for new coverage

---

## Notes

Safe failure may be a user-visible error or a no-op, but it must not be an
uncaught extension-host exception.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See [[docs/requirements/technical/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-026]].

> [!INFO] Red - 2026-05-07
> Added failing valid and invalid command bridge payload tests in
> `extension/src/command-bridges.test.ts`.

> [!INFO] Green - 2026-05-07
> Added shared JSON payload validation for locations, ranges, positions, file
> URIs, and diagnostic text; malformed payloads fail safely before native calls.

> [!INFO] In Review - 2026-05-07
> Local phase gate passed and payload validation coverage is ready for PR
> review.

> [!SUCCESS] Done - 2026-05-07
> PR #40 CI passed; command bridge payload validation is complete.
