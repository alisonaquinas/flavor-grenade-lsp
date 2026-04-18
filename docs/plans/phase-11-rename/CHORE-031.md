---
id: "CHORE-031"
title: "Phase 11 Lint Sweep"
type: chore
status: done
priority: "normal"
phase: "11"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/11"]
aliases: ["CHORE-031"]
---

# Phase 11 Lint Sweep

> [!INFO] `CHORE-031` · Chore · Phase 11 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run a full lint sweep over all Phase 11 source files introduced by TASK-109 through TASK-117. Resolve any linter warnings introduced during the phase so that `bun run lint --max-warnings 0` exits clean. No suppressions (`// eslint-disable`) may be added as a resolution strategy — underlying issues must be fixed.

---

## Motivation

Maintain zero-warning lint hygiene across the codebase as required by the Phase 11 quality gate. Lint drift accumulates quickly during active development and becomes harder to fix if deferred.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality requirements | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/prepare-rename.handler.ts` — lint fixes if needed
- `src/handlers/rename.handler.ts` — lint fixes if needed
- `src/handlers/workspace-edit-builder.ts` — lint fixes if needed
- `src/test/integration/rename.test.ts` — lint fixes if needed

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

- Nothing — can run after any Phase 11 task completes

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

This chore should be run after all Phase 11 task tickets reach `done`, before the phase gate is declared green.

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
> Chore created. Status: `open`. Motivation: Phase 11 lint sweep to maintain zero-warning hygiene.

> [!SUCCESS] Done — 2026-04-17
> Lint sweep completed. Fixed: removed unused `TextEdit` import from `workspace-edit-builder.test.ts`, removed unused `vaultUri` from `rename.handler.test.ts`, added return-type annotations to helper functions, removed unused `toDocId` import and `raw` destructure from `rename.handler.ts`. `bun run lint` exits clean with 0 warnings. `tsc --noEmit` exits 0. `bun test` passes with 371 tests, 0 failures.
