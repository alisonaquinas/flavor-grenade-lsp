---
id: "CHORE-023"
title: "Phase 8 Code Quality Sweep"
type: chore
status: done
priority: "normal"
phase: "8"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/8"]
aliases: ["CHORE-023"]
---

# Phase 8 Code Quality Sweep

> [!INFO] `CHORE-023` · Chore · Phase 8 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review and improve the internal code quality of the Phase 8 block reference subsystem with particular focus on two high-risk areas: `CrossBlockRef` null-target handling (intra-doc vs. cross-doc discrimination) and the FG005-vs-FG001 discrimination logic. Refactor for clarity and correctness without altering any observable LSP behaviour.

---

## Motivation

The `targetDocId: null` sentinel and the FG005/FG001 discrimination are subtle correctness invariants introduced in Phase 8. A dedicated quality sweep reduces the risk of silent logic errors reaching Phase 9.

- Motivated by: `Quality.CodeReview.PhaseGate` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality gate at phase boundary | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/resolution/link-resolver.ts` — null-target handling clarity
- `src/diagnostics/diagnostic-service.ts` — FG005 vs FG001 discrimination
- `src/resolution/ref-graph.ts` — `CrossBlockRef` type documentation
- Any other Phase 8 `src/` files requiring quality improvements

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR006-block-ref-indexing]] | Block anchor ID format and null-target semantics |

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] `CrossBlockRef` null-target path reviewed and documented inline
- [ ] FG005 vs FG001 discrimination logic reviewed and confirmed correct
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

Focus areas:

- `CrossBlockRef.targetDocId === null` must be checked before any doc-lookup attempt
- FG005 must only fire when target doc was found (or intra-doc) but anchor is missing; FG001 fires when target doc itself is missing

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: code quality sweep focusing on CrossBlockRef null-target handling and FG005/FG001 discrimination.

> [!SUCCESS] Done — 2026-04-17
> CrossBlockRef null-target path confirmed: `targetDocId === null` for intra-doc, `DocId` for cross-doc — checked at every call site before doc lookup. FG005/FG001 discrimination confirmed correct: FG001 fires when target doc is not found (via oracle), FG005 fires only when target doc resolves but anchor is absent. `@Optional()` decorators on VaultIndex and VaultIndex fields preserve backward compatibility with existing tests. Status: `done`.
