---
id: "TASK-197"
title: "Add OFMarkdown mode and status visuals"
type: task
status: green
priority: high
phase: E11
parent: "FEAT-029"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-028"]
tags: [tickets/task, "phase/E11"]
aliases: ["TASK-197"]
---

# Add OFMarkdown mode and status visuals

> [!INFO] `TASK-197` - Task - Phase E11 - Parent: [[FEAT-029]] - Status: `green`

## Description

Add current Marketplace README visuals that prove OFMarkdown language mode
promotion and status bar indexing behavior in an Obsidian or Flavor Grenade
vault.

---

## Implementation Notes

- Capture or add assets for OFMarkdown mode promotion and status indexing.
- Reference the visuals from `extension/README.md` with package-relative paths.
- See also: [[features/vscode-extension-parity]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Marketplace.OFMProof` | Required OFMarkdown visuals are present in the README | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Marketplace README includes OFMarkdown proof` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/marketplace/readme-assets.test.ts` | Extension | `Extension.Marketplace.OFMProof` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR016-ofmarkdown-language-mode]] | `ofmarkdown` is the extension language identity shown in Marketplace proof |

---

## Parent Feature

[[FEAT-029]] - Marketplace Evidence And Packaging Proof

---

## Dependencies

**Blocked by:**

- [[FEAT-028]] - Phase E10 provides the status indexing surface to capture

**Unblocks:**

- [[TASK-200]] - Package verification needs the README asset references

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] OFMarkdown mode promotion visual is referenced from `extension/README.md`
- [x] Status indexing visual is referenced from `extension/README.md`
- [x] Assets use Marketplace-supported formats
- [x] Linked verification test starts RED before implementation
- [x] `cd extension && npm test` passes after implementation
- [ ] [[test/matrix]] row updated for `Extension.Marketplace.OFMProof`
- [ ] [[test/index]] updated if a new test file is added
- [ ] Parent feature [[FEAT-029]] child task row updated to `in-review`

---

## Notes

The E11 phase gate names OFMarkdown visuals as the user-facing proof. Use small,
readable assets that survive Marketplace rendering.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements and BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint, type, and test clean; awaiting CI | Verify Definition of Done |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING]
> `red` before `green` is non-negotiable. See [[requirements/code-quality]]
> `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-029]].

> [!WARNING] Red - 2026-05-07
> Added failing Marketplace README asset coverage for OFMarkdown mode promotion
> and status indexing visuals.

> [!SUCCESS] Green - 2026-05-07
> Added README Marketplace proof section with OFMarkdown mode and status
> indexing PNG assets under `extension/images/marketplace/`.
