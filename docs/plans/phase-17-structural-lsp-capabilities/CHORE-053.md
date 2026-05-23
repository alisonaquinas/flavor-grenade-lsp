---
id: "CHORE-053"
title: "Phase 17 Lint Sweep"
type: chore
status: done
priority: medium
phase: 17
created: "2026-05-06"
updated: "2026-05-07"
dependencies: ["TASK-176", "TASK-177", "TASK-178", "TASK-179", "TASK-213"]
tags: [tickets/chore, "phase/17"]
aliases: ["CHORE-053"]
---

# Phase 17 Lint Sweep

> [!INFO] `CHORE-053` - Chore - Phase 17 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run the full linter across files introduced or modified for Phase 17 structural LSP capabilities. Resolve lint warnings without adding new suppressions and confirm the phase leaves the codebase lint clean.

---

## Motivation

Keeping lint clean after each feature phase prevents warning accumulation around shared LSP handler and service code.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase 17 must introduce no lint warnings | [[docs/requirements/technical/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase 17 implementation and test files - lint fixes only

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

- [[TASK-176]] - documentLink implementation should be complete
- [[TASK-177]] - foldingRange implementation should be complete
- [[TASK-178]] - selectionRange implementation should be complete
- [[TASK-179]] - Phase 17 tests should be complete
- [[TASK-213]] - Templater opaque region support should be complete

**Unblocks:**

- [[CHORE-055]] - documentation trace sweep should run after lint fixes settle file names and test paths

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behavior-affecting changes beyond lint fixes
- [ ] [[docs/test/matrix]] updated if any test files were added or removed
- [ ] [[docs/test/index]] updated if any test files were added or removed

---

## Notes

Run after all Phase 17 TASK tickets are in `done` or `in-review`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant: [[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-17 lint sweep for structural LSP capabilities.

> [!SUCCESS] In Review - 2026-05-07
> Verified `bun run lint -- --max-warnings 0`, `bun run typecheck`,
> `bun run build`, `bun test`, tagged Phase 17 BDD, docs lint, and diff check.
> No lint suppressions were added. Status: `in-review`.
