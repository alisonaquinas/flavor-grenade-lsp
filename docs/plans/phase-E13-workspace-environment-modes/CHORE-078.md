---
id: "CHORE-078"
title: "Phase E13 extension lint sweep"
type: chore
status: in-review
priority: medium
phase: E13
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-205", "TASK-206", "TASK-207"]
tags: [tickets/chore, "phase/E13"]
aliases: ["CHORE-078"]
---

# Phase E13 extension lint sweep

> [!INFO] `CHORE-078` - Chore - Phase E13 - Priority: `medium` - Status: `in-review`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Run the extension lint and typecheck gates after Phase E13 environment-mode
implementation. Resolve lint and type issues without changing observable server
startup behavior.

---

## Motivation

Environment gating touches startup code where small regressions can affect every
workspace. A focused sweep keeps the phase gate clean before documentation and
manual verification closeout.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase E13 must introduce no lint warnings | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase E13 implementation and test files - lint and type fixes only.

**Files created:**

- None.

**Files deleted:**

- None.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR015-platform-specific-vsix]] | Lint fixes must preserve platform-specific binary behavior |

---

## Dependencies

**Blocked by:**

- [[TASK-205]] - Restricted Mode implementation should be complete.
- [[TASK-206]] - virtual workspace implementation should be complete.
- [[TASK-207]] - binary resolution implementation should be complete.

**Unblocks:**

- [[CHORE-080]] - troubleshooting trace should run after file names settle.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [x] `tsc --noEmit` exits 0.
- [x] `bun test` passes with no regressions introduced.
- [x] No behaviour-affecting changes in `src/`.
- [x] [[test/matrix]] updated if any test files were added or removed.
- [x] [[test/index]] updated if any test files were added or removed.
- [x] Extension gate commands from [[plans/phase-E13-workspace-environment-modes]]
  are recorded.

---

## Notes

Run after the behavior tasks are in `done` or `in-review`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: post-Phase-E13 lint and type sweep.

> [!SUCCESS] In Review - 2026-05-07
> `cd extension && npm run check-types`, `cd extension && npm test`, root docs
> lint, and extension docs lint pass after the E13 environment changes.
