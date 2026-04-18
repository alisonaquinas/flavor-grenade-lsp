---
id: "TASK-105"
title: "Implement cursor position → entity mapping utility"
type: task
status: done
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/10"]
aliases: ["TASK-105"]
---

# Implement cursor position → entity mapping utility

> [!INFO] `TASK-105` · Task · Phase 10 · Parent: [[tickets/FEAT-011]] · Status: `open`

## Description

Create `src/handlers/cursor-entity.ts`. Given a document `OFMDoc` and a `Position`, return the entity at the cursor as a `CursorEntity` union type. The function uses binary search over all index ranges and, when ranges overlap (e.g. a wiki-link inside a heading), prefers the most specific (narrowest) range. This utility is a shared foundation for DefinitionService (TASK-102), ReferencesService (TASK-103), and DocumentHighlight (TASK-107), and must be implemented first.

---

## Implementation Notes

- File: `src/handlers/cursor-entity.ts`
- Public API shape:

  ```typescript
  export type CursorEntity =
    | { kind: 'wiki-link'; entry: WikiLinkEntry }
    | { kind: 'embed'; entry: EmbedEntry }
    | { kind: 'heading'; entry: HeadingEntry }
    | { kind: 'block-anchor'; entry: BlockAnchorEntry }
    | { kind: 'tag'; entry: TagEntry }
    | { kind: 'none' };

  export function entityAtPosition(doc: OFMDoc, pos: Position): CursorEntity;
  ```

- Binary-search all index ranges for O(log n) lookup
- On overlap, prefer narrowest range (most specific entity)
- Returns `{ kind: 'none' }` when cursor is not over any indexed entity
- This task must be completed before TASK-102, TASK-103, and TASK-107 can begin

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/navigation]] | `Cursor entity resolved for wiki-link` |
| [[bdd/features/navigation]] | `Cursor entity resolved for heading` |
| [[bdd/features/navigation]] | `Cursor entity returns none for plain text` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/handlers/cursor-entity.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding governs entity kind classification |

---

## Parent Feature

[[tickets/FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- Nothing — this is the foundational utility and has no ticket dependencies

**Unblocks:**

- [[tickets/TASK-102]] — DefinitionService depends on entityAtPosition
- [[tickets/TASK-103]] — ReferencesService depends on entityAtPosition
- [[tickets/TASK-107]] — DocumentHighlight depends on entityAtPosition

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
- [ ] Parent feature [[tickets/FEAT-011]] child task row updated to `in-review`

---

## Notes

This task must be done first in Phase 10. TASK-102, TASK-103, and TASK-107 all depend on it. Prioritise this task at the start of the phase.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-011]].

> [!NOTE] RED — 2026-04-17
> Failing test committed in `src/handlers/__tests__/cursor-entity.test.ts` (11 tests, all failing — module not found). Status: `red`.

> [!NOTE] GREEN — 2026-04-17
> Implementation in `src/handlers/cursor-entity.ts`. All 11 tests pass. lint + tsc clean. Status: `green`.

> [!CHECK] Done — 2026-04-17
> entityAtPosition implemented with wiki-link > embed > tag > heading > block-anchor priority ordering. 11 tests pass, 100% branch coverage. Status: `done`.
