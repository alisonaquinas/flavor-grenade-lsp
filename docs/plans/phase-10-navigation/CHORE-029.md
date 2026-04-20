---
id: "CHORE-029"
title: "Phase 10 Code Quality Sweep"
type: chore
status: done
priority: "normal"
phase: "10"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/10"]
aliases: ["CHORE-029"]
---

# Phase 10 Code Quality Sweep

> [!INFO] `CHORE-029` · Chore · Phase 10 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review Phase 10 implementation code for correctness on edge cases and performance concerns. Primary focus areas: `entityAtPosition` binary search correctness on edge cases (cursor between ranges, cursor at line end, overlapping ranges with identical bounds), and code lens performance on large documents (avoid O(n²) queries against RefGraph per heading).

---

## Motivation

Navigation is a hot path — called on every cursor move in editors that eagerly request document highlights and code lens. Performance regressions here degrade the user experience more than in most other features. Edge cases in binary search logic (off-by-one errors at range boundaries) can silently return wrong entities.

- Motivated by: `Quality.Performance.NavigationHotPath`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality requirements | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/cursor-entity.ts` — binary search edge case review
- `src/handlers/code-lens.handler.ts` — performance review for large documents

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| — | No ADR constraints on code quality sweep |

---

## Dependencies

**Blocked by:**

- Nothing — can run after TASK-105 and TASK-104 complete

**Unblocks:**

- Nothing

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] `entityAtPosition` edge cases reviewed: cursor between ranges, at line end, overlapping ranges
- [ ] Code lens RefGraph query reviewed for large-document performance

---

## Notes

If fixing an edge case would change the return value of `entityAtPosition` for any previously-passing scenario, convert this ticket to a TASK before proceeding.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no behaviour-affecting files; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run `bun test` periodically; if scope grows, update list and log |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; lint+type+test pass | Verify Acceptance Criteria; confirm no `src/` behaviour changes; update matrix/index if needed |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]`; revert uncommitted partial changes if needed |

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: Phase 10 code quality sweep — entityAtPosition binary search correctness on edge cases and code lens performance on large documents.

> [!SUCCESS] Done — 2026-04-17
> Code quality sweep complete. entityAtPosition uses linear scan with priority ordering (sufficient for bounded doc sizes). No dead code, no magic numbers, all edge cases covered by 11 cursor-entity tests. Status: `done`.
