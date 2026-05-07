---
id: "CHORE-084"
title: "Phase 17 Code Quality Sweep"
type: chore
status: done
priority: medium
phase: 17
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-176", "TASK-177", "TASK-178", "TASK-179", "TASK-213"]
tags: [tickets/chore, "phase/17"]
aliases: ["CHORE-084"]
---

# Phase 17 Code Quality Sweep

> [!INFO] `CHORE-084` - Chore - Phase 17 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: naming, module boundaries, documentation, and maintainability.

---

## Description

Review all Phase 17 source and test changes for naming consistency, module
boundaries, exported-symbol documentation, avoidable duplication, deep nesting,
and oversized functions before the phase PR is opened.

---

## Motivation

Phase execution Step F requires a code quality sweep after implementation tasks
and before final verification.

- Motivated by: [[plans/phase-execution]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Quality.Maintainability.Boundaries` | New code respects established module boundaries | [[requirements/code-quality]] |
| `Quality.TDD.StrictRedGreen` | Behavioural fixes discovered during the sweep are ticketed first | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase 17 `src/` and test files - code quality fixes only

**Files created:**

- New `BUG` or `CHORE` tickets for findings, if any

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR011-one-class-per-file-namespaces]] | Keep exported classes and handlers in focused files |
| [[ADR012-parser-safety-policy]] | Preserve parser safety and opaque-region ordering |

---

## Dependencies

**Blocked by:**

- [[TASK-179]] - implementation and structural coverage should be complete
- [[TASK-213]] - parser opaque-region changes should be complete

**Unblocks:**

- [[CHORE-085]] - security sweep should review quality-settled code

---

## Acceptance Criteria

- [ ] Review new Phase 17 source for naming and boundary consistency
- [ ] Review new exported symbols for useful documentation
- [ ] Open tickets for any non-trivial findings before fixing them
- [ ] `bun run typecheck` exits 0 after any fixes
- [ ] No observable behaviour changes are made without a `TASK` or `BUG` ticket

---

## Notes

This chore was added during Phase 17 Step A-C review because the phase had lint
and trace chores but no explicit Step F code quality sweep.

---

## Workflow Log

> [!INFO] Opened - 2026-05-07
> Chore created from Phase 17 Step A-C review. Status: `open`.

> [!SUCCESS] In Review - 2026-05-07
> Reviewed Phase 17 handler, parser, dispatcher, integration-test, and BDD
> changes. A fresh review found selection alignment, CRLF offset, opaque
> crossing, and trace issues; each was fixed with regression coverage.
> Status: `in-review`.
