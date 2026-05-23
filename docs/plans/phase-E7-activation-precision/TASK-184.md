---
id: "TASK-184"
title: "Document Activation Behavior"
type: task
status: done
priority: medium
phase: E7
parent: "FEAT-025"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-181", "TASK-182", "TASK-183"]
tags: [tickets/task, "phase/E7"]
aliases: ["TASK-184"]
---

# Document Activation Behavior

> [!INFO] `TASK-184` - Task - Phase E7 - Parent: [[FEAT-025]] - Status: `done`

## Description

Update extension-facing documentation so users and maintainers can tell when
the extension activates, when it stays idle, and how explicit commands wake it.
The docs must match the implemented marker, language, and command behavior.

---

## Implementation Notes

- Document `.obsidian/` and `.flavor-grenade.toml` activation
- Document generic Markdown idle behavior
- Document command wake behavior and startup checks
- See also: [[docs/plans/phase-E7-activation-precision]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.VaultPrecision` | Users can predict active and idle startup states | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.MarkerEvents` | Docs list marker, language, and command signals | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/vscode-extension-parity.feature` | Activation behavior is documented for vault and generic workspaces (planned scenario) (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/README.md` | Manual Docs Review | `Extension.Activation.VaultPrecision` | ✅ passing |
| `extension/docs/features/activation-behavior.md` | Manual Docs Review | `Extension.Activation.MarkerEvents` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Client UX behavior must be documented where users encounter it |

---

## Parent Feature

[[FEAT-025]] - Activation Precision And Startup Gating

---

## Dependencies

**Blocked by:**

- [[TASK-181]] - marker activation behavior must be known
- [[TASK-182]] - startup idle behavior must be known
- [[TASK-183]] - command and language wake behavior must be known

**Unblocks:**

- [[CHORE-062]] - trace sweep checks docs after content lands

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Extension docs describe all activation signals
- [x] Extension README describes generic Markdown idle behavior
- [x] Command wake behavior is documented without promising indexing
- [x] Docs link back to Phase E7 and extension parity requirements
- [x] Markdown lint passes for changed docs
- [x] [[docs/test/matrix]] and [[docs/test/index]] updated if needed

---

## Notes

This is a documentation task because it changes user-visible explanation, not
runtime behavior.

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
> Ticket created. Status: `open`. Parent: [[FEAT-025]].

> [!INFO] Green - 2026-05-07
> Documented activation behavior in `extension/README.md` and
> `extension/docs/features/activation-behavior.md`; markdown lint passed for
> the changed docs.

> [!INFO] In Review - 2026-05-07
> Documentation matches the implemented activation gate and is ready for PR
> review.

> [!SUCCESS] Done - 2026-05-07
> PR #39 CI passed; activation behavior documentation is complete.
