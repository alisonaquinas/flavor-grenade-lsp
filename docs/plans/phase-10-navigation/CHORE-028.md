---
id: "CHORE-028"
title: "Phase 10 Lint Sweep"
type: chore
status: done
priority: "normal"
phase: "10"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/10"]
aliases: ["CHORE-028"]
---

# Phase 10 Lint Sweep

> [!INFO] `CHORE-028` · Chore · Phase 10 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run a full lint sweep over all Phase 10 source files introduced by TASK-102 through TASK-108. Resolve any linter warnings introduced during the phase so that `bun run lint --max-warnings 0` exits clean. No suppressions (`// eslint-disable`) may be added as a resolution strategy — underlying issues must be fixed.

---

## Motivation

Maintain zero-warning lint hygiene across the codebase as required by the Phase 10 quality gate. Lint drift accumulates quickly during active development and becomes harder to fix if deferred.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality requirements | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/cursor-entity.ts` — lint fixes if needed
- `src/handlers/code-lens.handler.ts` — lint fixes if needed
- `src/handlers/document-highlight.handler.ts` — lint fixes if needed
- `src/test/integration/navigation.test.ts` — lint fixes if needed

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| — | No ADR constraints on lint sweep |

---

## Dependencies

**Blocked by:**

- Nothing — can run after any Phase 10 task completes

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

---

## Notes

This chore should be run after all Phase 10 task tickets reach `done`, before the phase gate is declared green.

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
> Chore created. Status: `open`. Motivation: Phase 10 lint sweep to maintain zero-warning hygiene.

> [!CHECK] Done — 2026-04-17
> `bun run lint --max-warnings 0` passes clean. `tsc --noEmit` exits 0. `bun test` passes 346 tests. No suppressions added. Status: `done`.
