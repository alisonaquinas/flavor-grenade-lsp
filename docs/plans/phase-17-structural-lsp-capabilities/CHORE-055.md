---
id: "CHORE-055"
title: "Phase 17 Documentation Trace Sweep"
type: chore
status: done
priority: medium
phase: 17
created: "2026-05-06"
updated: "2026-05-07"
dependencies: ["CHORE-053", "CHORE-054"]
tags: [tickets/chore, "phase/17"]
aliases: ["CHORE-055"]
---

# Phase 17 Documentation Trace Sweep

> [!INFO] `CHORE-055` - Chore - Phase 17 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit Phase 17 documentation traceability after implementation and test matrix updates. Confirm the phase plan, tickets, requirements, BDD references, API-layer capability matrix, and execution ledger all describe the same structural LSP behavior.

---

## Motivation

Structural LSP support crosses requirements, design, BDD, tests, and phase planning. A final trace sweep prevents drift between advertised capabilities and implemented behavior.

- Motivated by: `Parity.StructuralLSP.Coverage`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.Coverage` | Phase 17 documentation must trace structural behavior end to end | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Document-link docs must match resolver behavior | [[docs/requirements/functional/navigation]] |
| `Diagnostic.Ambiguous.RelatedInfo` | Ambiguity docs must match document-link behavior | [[docs/requirements/functional/diagnostics]] |

---

## Scope of Change

**Files modified:**

- `docs/plans/phase-17-structural-lsp-capabilities.md` - phase plan trace corrections if needed
- `docs/plans/phase-17-structural-lsp-capabilities/` - ticket trace corrections if needed
- `docs/design/api-layer.md` - structural capability matrix corrections if needed
- `docs/test/matrix.md` - trace corrections if needed
- `docs/test/index.md` - test inventory corrections if needed
- `docs/plans/execution-ledger.md` - Phase 17 gate evidence if needed

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

- [[CHORE-053]] - lint sweep should settle implementation file names
- [[CHORE-054]] - matrix sweep should settle test trace rows

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Phase 17 tickets link all source-plan requirements and relevant BDD files
- [ ] [[docs/design/api-layer]] matches the implemented provider declarations and method behavior
- [ ] [[docs/plans/phase-17-structural-lsp-capabilities]] acceptance and workstreams match completed tickets
- [ ] [[docs/plans/execution-ledger]] has accurate Phase 17 gate evidence if the phase is complete
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)

---

## Notes

This chore may update documentation outside the ticket folder during implementation, but ticket creation for this task is scoped to `docs/plans/phase-17-structural-lsp-capabilities/`.

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
> Chore created. Status: `open`. Motivation: Phase 17 documentation trace sweep.

> [!SUCCESS] In Review - 2026-05-07
> Audited phase plan, API-layer capability documentation, BDD trace, test
> matrix, and ticket links after implementation. Corrected structural API docs
> for Templater folds and opaque selection boundaries. Status: `in-review`.
