---
id: "CHORE-069"
title: "Phase E10 Lint And Typecheck Sweep"
type: chore
status: done
priority: medium
phase: E10
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-193", "TASK-194", "TASK-195", "TASK-196"]
tags: [tickets/chore, "phase/E10"]
aliases: ["CHORE-069"]
---

# Phase E10 Lint And Typecheck Sweep

> [!INFO] `CHORE-069` - Chore - Phase E10 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Run lint, typecheck, and regression tests over files touched by Phase E10 status
UX work. Fix style and type issues without changing the intended status
behavior.

---

## Motivation

Status UI changes touch extension-facing code where small type mismatches can
break recovery actions.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase E10 must introduce no lint warnings | [[docs/requirements/technical/code-quality]] |
| `Extension.Status.Diagnostics` | Status diagnostics implementation must remain type-safe | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- Phase E10 implementation and test files - lint and type fixes only

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| - | N/A |

---

## Dependencies

**Blocked by:**

- [[TASK-193]] - tooltip data implementation should be complete
- [[TASK-194]] - disabled and error states should be complete
- [[TASK-195]] - quick actions should be complete
- [[TASK-196]] - troubleshooting command and docs should be complete

**Unblocks:**

- [[CHORE-070]] - trace sweep should run after lint-only paths settle

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] `bun run lint --max-warnings 0` passes with no new suppressions added
- [x] `tsc --noEmit` exits 0
- [x] `bun test` passes (no regressions introduced)
- [x] Extension verification commands from [[docs/plans/phase-E10-status-ux-troubleshooting]] pass or blocker is documented
- [x] No behavior-affecting changes beyond lint and type fixes
- [x] [[docs/test/matrix]] updated if any test files were added or removed
- [x] [[docs/test/index]] updated if any test files were added or removed

---

## Notes

Run after all Phase E10 task tickets are in `done` or `in-review`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP
> method, stop and convert this ticket to a `TASK-NNN` before making that
> change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E10 lint and typecheck sweep.

> [!SUCCESS] Done - 2026-05-07
> Verified `bun run lint`, `bun run typecheck`, `bun run build`, `bun test`,
> extension `npm test`, `npm run check-types`, `npm run build:extension`, `npm
> run test:host`, `bun run lint:docs`, and extension-doc Markdown lint. `bun
> run bdd` remains blocked by existing undefined and pending BDD steps outside
> Phase E10.
