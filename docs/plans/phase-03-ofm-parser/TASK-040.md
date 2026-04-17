---
id: "TASK-040"
title: "Implement OpaqueRegionMarker"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-032", "TASK-033", "TASK-034"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-040"]
---

# Implement OpaqueRegionMarker

> [!INFO] `TASK-040` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Create `src/parser/opaque-region-marker.ts` implementing the `OpaqueRegionMarker` function and the `isInsideOpaqueRegion` utility. The marker runs `CommentParser`, `MathParser`, and `CodeParser` in sequence against the document body after frontmatter extraction, collects all returned `OpaqueRegion` arrays, merges them into a single sorted non-overlapping list, and returns it. The `isInsideOpaqueRegion` helper is the single query point used by all subsequent token parsers.

---

## Implementation Notes

- Run `CommentParser`, `MathParser`, `CodeParser` in that order
- Merge the three result arrays; sort by `start` offset
- Resolve overlaps by extending the end of the current region if the next region's start is within it (union semantics)
- `isInsideOpaqueRegion(offset, regions)` uses binary search for O(log n) lookup
- Export both `OpaqueRegionMarker` (function) and `isInsideOpaqueRegion` (function)
- See also: [[adr/ADR012-parser-safety-policy]]

```typescript
// src/parser/opaque-region-marker.ts
export interface OpaqueRegion {
  kind: 'code' | 'math' | 'comment';
  start: number;  // byte offset
  end: number;    // byte offset
}

export function isInsideOpaqueRegion(offset: number, regions: OpaqueRegion[]): boolean;
```

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Opaque region composition for OFM parser pipeline | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Wiki-link inside code block is not indexed` |
| [[bdd/features/tags]] | `Tag inside math block is not indexed` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/opaque-region-marker.test.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No I/O in parser; no ReDoS; bounded input |

---

## Parent Feature

[[tickets/FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-030]] — `OpaqueRegion` type must be defined
- [[tickets/TASK-032]] — `CommentParser` must be implemented
- [[tickets/TASK-033]] — `MathParser` must be implemented
- [[tickets/TASK-034]] — `CodeParser` must be implemented

**Unblocks:**

- [[tickets/TASK-035]] through [[tickets/TASK-039]] — all OFM token parsers depend on `isInsideOpaqueRegion`

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-004]] child task row updated to `in-review`

---

## Notes

Overlap resolution must be tested: if a comment `%% $formula$ %%` contains a math delimiter, only one merged region should appear — not two nested regions.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-004]].

> [!SUCCESS] Done — 2026-04-17
> Implemented and tested. All acceptance criteria met. Status: `done`.
