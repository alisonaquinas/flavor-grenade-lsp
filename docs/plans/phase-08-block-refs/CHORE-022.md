---
id: "CHORE-022"
title: "Phase 8 Lint Sweep"
type: chore
status: open
priority: "normal"
phase: "8"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/8"]
aliases: ["CHORE-022"]
---

# Phase 8 Lint Sweep

> [!INFO] `CHORE-022` · Chore · Phase 8 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run the full lint suite over all code introduced or modified in Phase 8 and resolve every warning without suppression. This sweep ensures the block reference subsystem enters Phase 9 with a clean lint baseline.

---

## Motivation

Lint warnings accumulate quickly during feature development. Sweeping at phase boundary keeps the codebase maintainable and prevents warning debt from carrying forward.

- Motivated by: `Quality.Lint.NoWarnings` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero lint warnings at phase boundary | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- All `src/` files introduced or modified during Phase 8 — lint fixes only

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| — | No ADR constraints specific to lint sweep |

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: lint sweep at Phase 8 boundary.
