---
id: "TASK-084"
title: "Add CrossBlock ref type to RefGraph"
type: task
status: done
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-083"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-084"]
---

# Add CrossBlock ref type to RefGraph

> [!INFO] `TASK-084` · Task · Phase 8 · Parent: [[tickets/FEAT-009]] · Status: `open`

## Description

Update `RefGraph` to track `[[doc#^blockid]]` references as a new `CrossBlockRef` type. The interface captures the source document, target document (null for intra-document refs), the anchor ID string, the originating `WikiLinkEntry`, the resolved `BlockAnchorEntry` (if found), and an optional diagnostic tag. Intra-document refs (`[[#^blockid]]`) set `targetDocId` to null and resolve within the source document.

---

## Implementation Notes

- New interface:
  ```typescript
  export interface CrossBlockRef {
    sourceDocId: DocId;
    targetDocId: DocId | null;   // null = intra-document
    anchorId: string;
    entry: WikiLinkEntry;
    resolvedTo: BlockAnchorEntry | null;
    diagnostic?: 'FG005';
  }
  ```
- Store `CrossBlockRef[]` in `RefGraph` alongside existing ref types
- Intra-doc case: `targetDocId === null` and resolution queries source doc's own `OFMIndex`
- See also: [[adr/ADR006-block-ref-indexing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block reference graph tracking | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/block-references]] | `RefGraph tracks CrossBlockRef entries` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/resolution/ref-graph.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-083]] — `BlockAnchorEntry` shape must be finalised before `CrossBlockRef.resolvedTo` can be typed

**Unblocks:**

- [[tickets/TASK-085]] — `LinkResolver` block ref resolution reads `CrossBlockRef` from `RefGraph`
- [[tickets/TASK-088]] — `ReferencesService` queries `RefGraph` for `CrossBlockRef` entries

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
