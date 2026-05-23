---
id: "CHORE-081"
title: "Phase E14 extension lint sweep"
type: chore
status: done
priority: medium
phase: E14
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-209", "TASK-210", "TASK-211", "TASK-212"]
tags: [tickets/chore, "phase/E14"]
aliases: ["CHORE-081"]
---

# Phase E14 extension lint sweep

> [!INFO] `CHORE-081` - Chore - Phase E14 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Run the extension lint and typecheck gates after Phase E14 membership and
compatibility work. Resolve lint and type issues without changing language-mode
or package-validation behavior.

---

## Motivation

Membership refresh touches event wiring and package checks touch release scripts.
A focused sweep prevents incidental warnings from hiding release risks.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase E14 must introduce no lint warnings | [[docs/requirements/technical/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase E14 implementation, test, and script files - lint and type fixes only.

**Files created:**

- None.

**Files deleted:**

- None.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR015-platform-specific-vsix]] | Lint fixes must preserve package target validation |

---

## Dependencies

**Blocked by:**

- [[TASK-209]] - server and index refresh implementation should be complete.
- [[TASK-210]] - workspace and editor refresh implementation should be complete.
- [[TASK-211]] - guarded reversion implementation should be complete.
- [[TASK-212]] - compatibility guardrails should be complete.

**Unblocks:**

- [[CHORE-082]] - package trace sweep should run after file names settle.
- [[CHORE-083]] - documentation sweep should run after file names settle.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [x] `tsc --noEmit` exits 0.
- [x] `bun test` passes with no regressions introduced.
- [x] No behaviour-affecting changes in `src/`.
- [x] [[docs/test/matrix]] updated if any test files were added or removed.
- [x] [[docs/test/index]] updated if any test files were added or removed.
- [x] Extension gate commands from
  [[docs/plans/phase-E14-membership-refresh-compatibility-guardrails]] are recorded.

---

## Notes

Run after all Phase E14 TASK tickets are in `done` or `in-review`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: post-Phase-E14 lint and type sweep.

> [!INFO] In Review - 2026-05-07
> Local gates passed: `bun run lint`, `bun run typecheck`, `bun test`,
> `npm run check-types`, `npm test`, and `npm run build:extension`. No lint
> suppressions were added.

> [!SUCCESS] Done - 2026-05-07
> PR #46 CI passed and phase closeout completed.
