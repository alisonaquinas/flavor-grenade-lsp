---
id: "TASK-091"
title: "Write unit tests for block ref resolution"
type: task
status: done
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-085", "TASK-086"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-091"]
---

# Write unit tests for block ref resolution

> [!INFO] `TASK-091` · Task · Phase 8 · Parent: [[tickets/FEAT-009]] · Status: `open`

## Description

Author comprehensive unit tests for the block ref resolution subsystem in `src/resolution/__tests__/block-ref-resolver.test.ts`. The test suite covers the full range of resolution scenarios established during Phase 8: cross-document resolution, intra-document resolution, missing anchor (FG005), missing target doc (FG001 from existing path), anchor at end-of-file, anchor on list item, completion for cross-doc and intra-doc triggers. Integration smoke test: `tests/integration/smoke-block-references.md`.

---

## Implementation Notes

- Test file: `src/resolution/__tests__/block-ref-resolver.test.ts`
- Required test cases:
  - Cross-document ref resolves to anchor in another doc
  - Intra-document ref `[[#^id]]` resolves to own anchor
  - Missing anchor in existing doc → FG005
  - Missing doc entirely → FG001 (handled by wiki-link resolver, not FG005)
  - Anchor at end-of-file with no trailing newline is still found
  - Anchor in list item is indexed correctly
  - Completion returns correct anchors for target doc
  - Completion for intra-doc `[[#^` returns current doc's anchors
- Integration smoke: `tests/integration/smoke-block-references.md`
- Linked test: `tests/integration/smoke-block-references.md`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block ref resolution correctness across all cases | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/block-references]] | All scenarios in feature file |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/__tests__/block-ref-resolver.test.ts` | Unit | — | 🔴 failing |
| `tests/integration/smoke-block-references.md` | Integration | — | 🔴 failing |

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

- [[tickets/TASK-085]] — resolution logic must be implemented before tests can go green
- [[tickets/TASK-086]] — FG005 emission must be in place for diagnostic test cases

**Unblocks:**

- None within Phase 8; this is the final implementation task

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
