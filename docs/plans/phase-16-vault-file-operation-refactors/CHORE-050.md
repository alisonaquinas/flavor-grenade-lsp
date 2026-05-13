---
id: "CHORE-050"
title: "Phase 16 Lint Sweep"
type: chore
status: done
priority: medium
phase: 16
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-174"]
tags: [tickets/chore, "phase/16"]
aliases: ["CHORE-050"]
---

# Phase 16 Lint Sweep

> [!INFO] `CHORE-050` · Chore · Phase 16 · Priority: `medium` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Run the full linter across files introduced or modified for Phase 16 file
operation refactors. Resolve lint warnings without adding new suppressions and
confirm the file operation handler, planner, rewriter, validator, refresh logic,
and regression tests remain lint-clean.

---

## Motivation

Keeping lint clean after the Phase 16 implementation prevents warning debt in a
high-risk refactor path that touches LSP file operations and vault path
handling.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero lint warnings for implementation and tests | [[docs/requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase 16 implementation and test files — lint-only fixes

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | Lint fixes must not change file operation behavior |

---

## Dependencies

**Blocked by:**

- [[TASK-174]] — run after Phase 16 implementation and regression tests land

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] `bun run lint --max-warnings 0` passes with no new suppressions added
- [x] `tsc --noEmit` exits 0
- [x] `bun test` passes
- [x] No behaviour-affecting changes in `src/`

---

## Notes

This chore is limited to cleanup after Phase 16 implementation work.

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
> Chore created. Status: `open`. Motivation: post-Phase-16 lint sweep.

> [!SUCCESS] Done - 2026-05-06
> `bun run lint -- --max-warnings 0`, `bun run typecheck`,
> `bun run build`, and `bun test` pass after the Phase 16 provider-injection
> fix. Status: `done`.
