---
id: "TASK-071"
title: "Implement tag hierarchy queries"
type: task
status: open
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-067"]
tags: [tickets/task, "phase/6"]
aliases: ["TASK-071"]
---

# Implement tag hierarchy queries

> [!INFO] `TASK-071` · Task · Phase 6 · Parent: [[tickets/FEAT-007]] · Status: `open`

## Description

Add a `TagRegistry.hierarchy()` method that constructs and returns the tag tree as an array of `TagNode` root nodes. Each node carries the tag segment name, the full tag string, an array of child `TagNode` objects, and an occurrence count aggregated across the subtree. The hierarchy is derived from the slash-separated structure of all indexed tags (e.g., `#project/active` and `#project/done` both become children of `#project`). The hierarchy tree will be consumed by the workspace symbol provider in Phase 12.

---

## Implementation Notes

- Add `TagNode` interface: `{ tag: string; fullTag: string; children: TagNode[]; occurrenceCount: number }`
- `hierarchy(): TagNode[]` returns root-level nodes only (tags with no parent segment)
- Build tree by splitting each tag on `/` and inserting into a trie-like structure
- `occurrenceCount` on a parent node is the sum of its own occurrences plus all descendants
- See also: [[requirements/tag-indexing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Tag hierarchy tree for workspace symbol provider | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/tags]] | `Tag hierarchy reflects nested tag structure` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-vault-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Tag hierarchy is scoped to OFM syntax only |

---

## Parent Feature

[[tickets/FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-067]] — TagRegistry must exist before hierarchy can be added to it

**Unblocks:**

- None within Phase 6 (consumed by Phase 12)

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
- [ ] Parent feature [[tickets/FEAT-007]] child task row updated to `in-review`

---

## Notes

The hierarchy method is read-only and derives its tree from the existing flat index, so it does not require a separate data structure to be maintained during incremental updates.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-007]].
