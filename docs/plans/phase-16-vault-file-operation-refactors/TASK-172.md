---
id: "TASK-172"
title: "Validate all-or-nothing WorkspaceEdit output"
type: task
status: open
priority: high
phase: 16
parent: "FEAT-023"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-171"]
tags: [tickets/task, "phase/16"]
aliases: ["TASK-172"]
---

# Validate all-or-nothing WorkspaceEdit output

> [!INFO] `TASK-172` · Task · Phase 16 · Parent: [[FEAT-023]] · Status: `open`

## Description

Validate the complete edit graph before returning a WorkspaceEdit from
`workspace/willRenameFiles`. If any document has overlapping edits, invalid
ranges, unresolved conflicts, or a path confinement failure from the planner,
the handler must reject the whole refactor instead of returning a partial edit.

---

## Implementation Notes

- Sort and validate edits per document before constructing the final response
- Treat any overlap as a full WorkspaceEdit cancellation
- Preserve skipped-reference report data from [[TASK-171]] while cancelling only
  for invalid edits, unsafe paths, or edit conflicts
- Keep validation separate from rewrite generation
- See also: [[ADR018-vault-file-operation-refactoring]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.AtomicRefactor` | Return all reference edits atomically or return no edit | [[requirements/ofmarkdown-parity]] |
| `Security.Vault.RenameConfinement` | Cancel unsafe rename and move edits before returning them | [[requirements/security/vault-confinement]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/workspace-edit-validator.spec.ts` | Unit | `Parity.FileOperations.AtomicRefactor` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | Validate the full WorkspaceEdit before returning it |

---

## Parent Feature

[[FEAT-023]] — Vault File Operation Refactors

---

## Dependencies

**Blocked by:**

- [[TASK-171]] — validation requires generated reference edits

**Unblocks:**

- [[TASK-173]] — refresh work assumes the pre-apply refactor contract is stable

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Overlapping edits cancel the entire WorkspaceEdit
- [ ] Skipped ambiguous references remain reportable and do not count as
      validation conflicts by themselves
- [ ] Valid edit sets are returned in deterministic order
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-023]] child task row updated to `in-review`

---

## Notes

This is the atomicity gate for Phase 16. Do not let partial edits escape this
layer.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ →
`in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-023]].
