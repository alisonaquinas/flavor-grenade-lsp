---
id: "TASK-200"
title: "Verify README assets in packaged VSIX"
type: task
status: open
priority: high
phase: E11
parent: "FEAT-029"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-197", "TASK-198", "TASK-199"]
tags: [tickets/task, "phase/E11"]
aliases: ["TASK-200"]
---

# Verify README assets in packaged VSIX

> [!INFO] `TASK-200` - Task - Phase E11 - Parent: [[FEAT-029]] - Status: `open`

## Description

Add package inspection evidence that every required asset referenced by the
extension README is present in the VSIX and uses a Marketplace-supported format.

---

## Implementation Notes

- Inspect the packaged VSIX contents after `npx vsce package --no-dependencies`.
- Cross-check required README asset references against the archive contents.
- See also: [[research/vscode-extension-publishing]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Packaging.TargetBinaryValidation` | Referenced README assets are present in packaged VSIX output | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Marketplace README includes OFMarkdown proof` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/marketplace/vsix-assets.test.ts` | Extension | `Extension.Packaging.TargetBinaryValidation` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Extension releases ship as platform-specific VSIX packages |

---

## Parent Feature

[[FEAT-029]] - Marketplace Evidence And Packaging Proof

---

## Dependencies

**Blocked by:**

- [[TASK-197]] - OFMarkdown mode and status assets must be referenced
- [[TASK-198]] - Completion and navigation assets must be referenced
- [[TASK-199]] - Diagnostics, hover, tag, and callout assets must be referenced

**Unblocks:**

- [[FEAT-030]] - E12 can proceed with Marketplace proof preserved

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] README asset parser identifies every required Marketplace visual reference
- [ ] VSIX inspection confirms each required asset is packaged
- [ ] Unsupported image formats fail the verification
- [ ] `cd extension && npm run build:extension` passes
- [ ] `cd extension && npx vsce package --no-dependencies` passes
- [ ] [[test/matrix]] row updated for `Extension.Packaging.TargetBinaryValidation`
- [ ] [[test/index]] updated if a new test file is added
- [ ] Parent feature [[FEAT-029]] child task row updated to `in-review`

---

## Notes

This task is the phase gate. It should catch `.vscodeignore` mistakes and stale
README paths before publishing.

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
