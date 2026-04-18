---
id: "TASK-083"
title: "Ensure BlockAnchorEntry is fully populated"
type: task
status: done
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/8"]
aliases: ["TASK-083"]
---

# Ensure BlockAnchorEntry is fully populated

> [!INFO] `TASK-083` · Task · Phase 8 · Parent: [[tickets/FEAT-009]] · Status: `open`

## Description

Verify that `BlockAnchorParser` (introduced in Phase 3) correctly produces `BlockAnchorEntry` objects with all three required fields: `id` (anchor ID without the `^`), `range` (LSP Range covering `^anchor-id` on its source line), and `lineRange` (Range of the entire line containing the anchor). Add unit-test edge cases covering anchor at very end of file, anchor on a list item line, and anchor on a heading line (Obsidian supports anchors on headings).

---

## Implementation Notes

- Expected interface shape:

  ```typescript
  export interface BlockAnchorEntry {
    id: string;        // anchor ID without ^
    range: Range;      // covers "^anchor-id" text only
    lineRange: Range;  // covers the entire source line
  }
  ```

- Edge case: anchor at EOF with no trailing newline — `lineRange` must still be valid
- Edge case: anchor on list item — parser must not strip list marker from `id`
- Edge case: anchor on heading line — verify `id` does not include `#` characters
- See also: [[adr/ADR006-block-ref-indexing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block anchor indexing correctness | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/block-references]] | `BlockAnchorParser populates all entry fields` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/parser/block-anchor-parser.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR006-block-ref-indexing]] | Block anchor ID format and indexing strategy |

---

## Parent Feature

[[tickets/FEAT-009]] — Block References

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[tickets/TASK-084]] — CrossBlockRef type depends on `BlockAnchorEntry` shape being correct

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
- [ ] Parent feature [[tickets/FEAT-009]] child task row updated to `in-review`

---

## Notes

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-009]].
