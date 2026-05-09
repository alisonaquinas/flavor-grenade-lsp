---
id: "TASK-170"
title: "Build vault-confined move planner"
type: task
status: done
priority: high
phase: 16
parent: "FEAT-023"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-169"]
tags: [tickets/task, "phase/16"]
aliases: ["TASK-170"]
---

# Build vault-confined move planner

> [!INFO] `TASK-170` · Task · Phase 16 · Parent: [[FEAT-023]] · Status: `done`

## Description

Build the planner that converts client file operation events into old/new
vault-relative mappings for notes, attachments, and folders. The planner must
canonicalize every source and target, reject the entire operation when any path
escapes the vault root, and preserve extension-free DocId semantics for notes.

---

## Implementation Notes

- Expand folder moves into per-file mappings using vault-relative paths
- Treat Markdown notes as extension-free DocIds after vault confinement succeeds
- Keep attachment paths extension-bearing where required by link syntax
- See also: [[ADR018-vault-file-operation-refactoring]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.MovePlannerConfinement` | Canonicalize old/new paths and reject moves escaping the vault | [[requirements/functional/ofmarkdown-parity]] |
| `Security.Vault.PathConfinement` | Canonicalize and vault-root-check old and new paths | [[requirements/security/vault-confinement]] |
| `Security.Vault.RenameConfinement` | Refuse operations that escape the vault root | [[requirements/security/vault-confinement]] |
| `Parity.FileOperations.AtomicRefactor` | Build one complete move graph before edits are returned | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/vault/file-operation-planner.spec.ts` | Unit | `Security.Vault.PathConfinement` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | Planning must happen before rewrite generation |

---

## Parent Feature

[[FEAT-023]] — Vault File Operation Refactors

---

## Dependencies

**Blocked by:**

- [[TASK-169]] — planner is invoked by the file operation handler

**Unblocks:**

- [[TASK-171]] — reference rewriting requires old/new move mappings

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Escaping source or target paths cancel the full plan
- [ ] Folder moves expand without duplicate or overlapping target mappings
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-023]] child task row updated to `in-review`

---

## Notes

This task owns vault confinement. Later tasks should consume planner output
instead of re-checking raw client paths.

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

> [!FAILURE] Red - 2026-05-06
> Added failing planner coverage for note moves, attachment moves, folder
> expansion, and whole-plan rejection when a source or target escapes the vault
> root. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added a vault-confined `FileOperationPlanner` that canonicalizes file URIs,
> rejects out-of-vault operations as a whole-plan failure, maps Markdown notes
> to extension-free DocIds, preserves extension-bearing attachment paths, and
> expands folder moves across known notes and attachments. Focused planner
> tests, `bun run typecheck`, and `bun run lint -- --max-warnings 0` pass.
> Status: `done`.
