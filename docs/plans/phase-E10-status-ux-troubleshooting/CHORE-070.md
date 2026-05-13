---
id: "CHORE-070"
title: "Phase E10 Test Matrix Sweep"
type: chore
status: done
priority: medium
phase: E10
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-193", "TASK-194", "TASK-195", "TASK-196", "CHORE-069"]
tags: [tickets/chore, "phase/E10"]
aliases: ["CHORE-070"]
---

# Phase E10 Test Matrix Sweep

> [!INFO] `CHORE-070` - Chore - Phase E10 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Update the test matrix and test index for Phase E10 status tooltip, disabled
state, quick action, diagnostic copy, and troubleshooting tests.

---

## Motivation

Support-facing behavior needs exact traceability so regressions can be mapped
from status states back to requirements and tests.

- Motivated by: `Extension.Status.Diagnostics`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Status diagnostic test rows must be traceable | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Status.QuickActions` | Quick-action and diagnostic-copy tests must be traceable | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` - Phase E10 requirement rows
- `docs/test/index.md` - Phase E10 test file inventory

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

- [[TASK-193]] - tooltip test paths must settle
- [[TASK-194]] - disabled state test paths must settle
- [[TASK-195]] - quick-action test paths must settle
- [[TASK-196]] - troubleshooting test paths must settle
- [[CHORE-069]] - lint and typecheck sweep should be complete

**Unblocks:**

- [[CHORE-071]] - documentation trace sweep should reference final trace rows

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] [[docs/test/matrix]] includes Phase E10 rows for status diagnostics and quick actions
- [x] [[docs/test/index]] includes every new Phase E10 unit or host test file
- [x] Test statuses match the actual verification command result
- [x] `bun run lint --max-warnings 0` passes with no new suppressions added
- [x] `tsc --noEmit` exits 0
- [x] `bun test` passes (no regressions introduced)
- [x] No behavior-affecting changes in `src/`

---

## Notes

This chore should not invent new tests. It records the files produced by
[[TASK-193]], [[TASK-194]], [[TASK-195]], and [[TASK-196]].

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
> Chore created. Status: `open`. Motivation: Phase E10 status test traceability.

> [!SUCCESS] Done - 2026-05-07
> Updated [[docs/test/matrix]] and [[docs/test/index]] for Phase E10 status diagnostics,
> quick actions, troubleshooting coverage, and the expanded host status suite.
