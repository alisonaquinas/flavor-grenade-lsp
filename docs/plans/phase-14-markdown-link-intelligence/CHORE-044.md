---
id: "CHORE-044"
title: "Phase 14 Lint Sweep"
type: chore
status: done
priority: medium
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-156", "TASK-157", "TASK-158", "TASK-159", "TASK-160", "TASK-161", "TASK-162"]
tags: [tickets/chore, "phase/14"]
aliases: ["CHORE-044"]
---

# Phase 14 Lint Sweep

> [!INFO] `CHORE-044` · Chore · Phase 14 · Priority: `medium` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Run the linter across all source, test, and documentation files touched by
Phase 14. Resolve warnings without adding suppressions and keep Markdown link
parsing, resolution, diagnostics, navigation, and rename code style-consistent.

---

## Motivation

Phase 14 touches parser, resolution, graph, handlers, diagnostics, navigation,
and rename surfaces. A dedicated lint sweep prevents small inconsistencies from
landing across many modules.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase changes must not introduce lint warnings | [[docs/requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase 14 source files - lint-only cleanup.
- Phase 14 test files - lint-only cleanup.
- Phase 14 docs and ticket files - Markdown lint cleanup.

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Lint cleanup must not alter Markdown link behavior |

---

## Dependencies

**Blocked by:**

- [[TASK-156]] - parser work complete.
- [[TASK-157]] - classifier work complete.
- [[TASK-158]] - RefGraph work complete.
- [[TASK-159]] - Oracle work complete.
- [[TASK-160]] - diagnostics work complete.
- [[TASK-161]] - navigation work complete.
- [[TASK-162]] - rename work complete.

**Unblocks:**

- [[FEAT-021]] - phase feature review.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [ ] `tsc --noEmit` exits 0.
- [ ] `bun test` passes.
- [ ] No behaviour-affecting changes are made during this chore.
- [ ] Markdown files touched by Phase 14 remain lint-friendly.

---

## Notes

Run after all behavior tasks are complete. Any behavior change discovered during
lint cleanup belongs back in the relevant task ticket.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP
> method, stop and convert this ticket to a `TASK-NNN` before making that
> change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order.
> Do not edit previous entries. Update the `status` frontmatter field to match
> the current state whenever adding an entry.

> [!INFO] Opened - 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-14 lint sweep.

> [!INFO] Started - 2026-05-06
> Step E lint sweep started after Phase 14 implementation tasks reached green.
> Status: `in-progress`.

> [!INFO] Review Ready - 2026-05-06
> `bun run lint -- --max-warnings 0`, `bun run typecheck`, and `bun test`
> pass after BUG-002 was opened and fixed. Status: `in-review`.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.
