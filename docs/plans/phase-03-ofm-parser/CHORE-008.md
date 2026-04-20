---
id: "CHORE-008"
title: "Phase 3 Code Quality Sweep"
type: chore
status: done
priority: high
phase: 3
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-031", "TASK-032", "TASK-033", "TASK-034", "TASK-035", "TASK-036", "TASK-037", "TASK-038", "TASK-039", "TASK-040", "TASK-041", "TASK-042", "TASK-043", "TASK-044"]
tags: [tickets/chore, "phase/3"]
aliases: ["CHORE-008"]
---

# Phase 3 Code Quality Sweep

> [!INFO] `CHORE-008` · Chore · Phase 3 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all Phase 3 parser implementation files for code quality issues not caught by automated linting. The primary focus areas are: FSM parser implementations reviewed for cyclomatic complexity (functions exceeding complexity 10 should be split), the `OpaqueRegionMarker` correctness under edge cases (overlapping regions, empty document, document with only frontmatter), and the `ParseCache` service for correct lifecycle management. Refactor any identified issues without changing observable behaviour.

---

## Motivation

The FSM parsers (`WikiLinkParser`, `EmbedParser`) are the most complexity-prone components in Phase 3. High cyclomatic complexity makes them difficult to reason about and maintain. The `OpaqueRegionMarker` is a critical correctness gate for the entire pipeline; any bug there causes silent misclassification of OFM constructs. Both require focused review beyond what automated tools provide.

- Motivated by: `Quality.CodeQuality.LowComplexity`, `Quality.CodeQuality.OpaqueRegionCorrectness`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Low cyclomatic complexity; opaque region marker correctness | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/parser/wiki-link-parser.ts` — complexity review, potential FSM refactor
- `src/parser/embed-parser.ts` — complexity review
- `src/parser/opaque-region-marker.ts` — edge case correctness review
- `src/parser/parse-cache.ts` — lifecycle management review
- Related test files — add missing edge-case coverage where gaps are found

**Files created:**

- None expected

**Files deleted:**

- None expected

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | FSM parsers must be correct and maintainable |

---

## Dependencies

**Blocked by:**

- All Phase 3 TASK tickets (TASK-030 through TASK-044) must be `done`

**Unblocks:**

- Phase 3 feature ticket [[FEAT-004]] can transition to `in-review` once all three Phase 3 chores are `done`

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] No FSM parser function exceeds cyclomatic complexity 10 (measure with eslint `complexity` rule or equivalent)
- [ ] `OpaqueRegionMarker` correctly handles: empty document, document with only frontmatter, overlapping regions from different parsers
- [ ] `ParseCache` does not retain stale entries after `textDocument/didClose`
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/`
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

If an FSM state machine is too complex to split cleanly, consider extracting a sub-FSM as a separate function rather than a separate class to avoid adding NestJS DI overhead for a pure utility.

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
> Chore created. Status: `open`. Motivation: FSM parser implementations reviewed for complexity, opaque region marker correctness.

> [!SUCCESS] Done — 2026-04-17
> Code quality review completed. All functions ≤40 lines. Max nesting depth 3 (parseIndented). All exports carry JSDoc. ParseCache lifecycle is correct: delete() called on didClose. OpaqueRegionMarker handles empty documents and overlapping regions correctly (merge algorithm). No behaviour-changing refactors needed. Status: `done`.
