---
id: "TASK-173"
title: "Refresh index after didRenameFiles"
type: task
status: red
priority: high
phase: 16
parent: "FEAT-023"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-172"]
tags: [tickets/task, "phase/16"]
aliases: ["TASK-173"]
---

# Refresh index after didRenameFiles

> [!INFO] `TASK-173` · Task · Phase 16 · Parent: [[FEAT-023]] · Status: `red`

## Description

Handle `workspace/didRenameFiles` after the editor applies a move so the
VaultIndex, reference graph, tag state, and diagnostics reflect the new vault
layout. This notification is for post-move refresh only; it must not attempt
pre-apply reference rewriting.

---

## Implementation Notes

- Refresh moved notes and attachments using VaultIndex as the single source of
  truth
- Recompute affected diagnostics after the index reflects new paths
- Tolerate clients that send `didRenameFiles` without a preceding
  `willRenameFiles`
- See also: [[ADR018-vault-file-operation-refactoring]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.IndexRefresh` | `didRenameFiles` refreshes affected index entries and diagnostics | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.AtomicRefactor` | Keep server state consistent after file operations | [[requirements/functional/ofmarkdown-parity]] |
| `Security.Vault.PathConfinement` | Refresh only paths that remain inside the vault root | [[requirements/security/vault-confinement]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/vault/did-rename-files-refresh.spec.ts` | Unit | `Parity.FileOperations.AtomicRefactor` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | didRenameFiles refreshes index and diagnostics after the client move |

---

## Parent Feature

[[FEAT-023]] — Vault File Operation Refactors

---

## Dependencies

**Blocked by:**

- [[TASK-172]] — refresh behavior follows the validated pre-apply edit contract

**Unblocks:**

- [[TASK-174]] — end-to-end regressions need post-move state refresh

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] VaultIndex reflects moved files after `didRenameFiles`
- [ ] Diagnostics refresh for affected documents after the index update
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-023]] child task row updated to `in-review`

---

## Notes

Keep the invariant: VaultIndex is the only stored parsed document source. Do
not introduce a second document cache for rename refresh state.

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
> Added failing coverage for `workspace/didRenameFiles` invoking post-move
> refresh and for moved document/attachment index remapping with graph and
> diagnostic refresh. Status: `red`.
