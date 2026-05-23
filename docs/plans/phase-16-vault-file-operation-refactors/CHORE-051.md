---
id: "CHORE-051"
title: "Phase 16 Test Matrix Sweep"
type: chore
status: done
priority: medium
phase: 16
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-174"]
tags: [tickets/chore, "phase/16"]
aliases: ["CHORE-051"]
---

# Phase 16 Test Matrix Sweep

> [!INFO] `CHORE-051` · Chore · Phase 16 · Priority: `medium` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Audit the Phase 16 test inventory and traceability matrix after the regression
suite lands. Every new or changed test must be represented in [[docs/test/index]],
and every linked Phase 16 requirement must have an accurate [[docs/test/matrix]] row.

---

## Motivation

Phase 16 adds cross-cutting behavior for LSP file operations, path confinement,
reference rewriting, and index refresh. Traceability needs a final pass after
the implementation settles.

- Motivated by: [[docs/test/matrix]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.AtomicRefactor` | File operation regression evidence is represented in the matrix | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Security.Vault.RenameConfinement` | Rename confinement evidence is represented in the matrix | [[docs/requirements/functional/security-vault-confinement]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` — Phase 16 requirement evidence rows
- `docs/test/index.md` — Phase 16 test inventory rows

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | Matrix rows must reflect the final file operation pipeline |

---

## Dependencies

**Blocked by:**

- [[TASK-174]] — final test files must exist before the matrix sweep

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] [[docs/test/matrix]] contains Phase 16 requirement evidence rows
- [x] [[docs/test/index]] contains every Phase 16 test file
- [x] `bun run lint --max-warnings 0` passes
- [x] `tsc --noEmit` exits 0
- [x] `bun test` passes
- [x] No behaviour-affecting changes in `src/`

---

## Notes

This chore may modify docs outside the ticket folder when executed later. This
ticket creation task does not grant that implementation scope.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP
> method, stop and convert this ticket to a `TASK-NNN` before making that
> change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened — 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-16 test traceability.

> [!SUCCESS] Done - 2026-05-06
> Added Phase 16 unit and integration evidence to [[docs/test/index]]. Also updated
> the [[docs/test/matrix]] page with file-operation capability, planner, rewriter, validator,
> refresh, regression, and security-confinement coverage. Status: `done`.
