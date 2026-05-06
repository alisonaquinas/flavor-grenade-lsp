---
id: "CHORE-054"
title: "Phase 17 Test Matrix Sweep"
type: chore
status: open
priority: medium
phase: 17
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-179"]
tags: [tickets/chore, "phase/17"]
aliases: ["CHORE-054"]
---

# Phase 17 Test Matrix Sweep

> [!INFO] `CHORE-054` - Chore - Phase 17 - Priority: `medium` - Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit [[test/matrix]] and [[test/index]] after Phase 17 tests land. Confirm every structural LSP test row maps to the correct requirement tag and that stale or missing rows are corrected.

---

## Motivation

The Phase 17 gate depends on `Parity.StructuralLSP.Coverage` evidence. The matrix and test index must show which tests prove document links, folding ranges, selection ranges, opaque-region boundaries, and ambiguity handling.

- Motivated by: `Parity.StructuralLSP.Coverage`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.Coverage` | Structural LSP test coverage must be traceable | [[requirements/ofmarkdown-parity]] |
| `ST-002` | Opaque-region tests must be traceable | [[requirements/semantic-tokens]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` - Phase 17 requirement-to-test rows
- `docs/test/index.md` - Phase 17 test inventory rows

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

- [[TASK-179]] - final structural LSP tests must exist before trace rows can be audited

**Unblocks:**

- [[CHORE-055]] - documentation trace sweep depends on final test trace targets

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] [[test/matrix]] contains passing rows for `Parity.StructuralLSP.Coverage`
- [ ] [[test/matrix]] contains rows for `Navigation.Definition.AllLinkTypes`, `ST-002`, `Security.Input.PositionValidation`, and `Diagnostic.Ambiguous.RelatedInfo` where Phase 17 adds evidence
- [ ] [[test/index]] lists every new Phase 17 unit, integration, and BDD test file
- [ ] No stale Phase 17 test paths remain in either document
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)

---

## Notes

Run after [[TASK-179]] and before [[CHORE-055]].

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Chore created. Status: `open`. Motivation: Phase 17 test matrix and test index trace sweep.
