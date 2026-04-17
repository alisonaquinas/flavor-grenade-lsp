---
id: "TASK-090"
title: "Handle intra-document block refs"
type: task
status: open
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-089"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-090"]
---

# Handle intra-document block refs

> [!INFO] `TASK-090` · Task · Phase 8 · Parent: [[tickets/FEAT-009]] · Status: `open`

## Description

Extend the block reference subsystem to fully support intra-document block refs of the form `[[#^id]]`, where `WikiLinkEntry.target === ''` and `WikiLinkEntry.blockId` is set. These refs resolve within the source document's own `OFMIndex` — no cross-doc lookup is needed. For completion, after `[[#^` (no target document stem), the provider enumerates block anchors from the current document rather than a remote one.

---

## Implementation Notes

- Resolution (in `LinkResolver`, already covered by TASK-085 logic): when `entry.target === ''`, query source doc's `OFMIndex.blockAnchors`
- Completion trigger: text ending with `[[#^` before cursor (no stem between `[[` and `#^`)
- Intra-doc completion path: enumerate current doc's `OFMIndex.blockAnchors` — no `Oracle` call needed
- FG005 suppression in single-file mode does NOT apply to intra-doc refs (the anchor must exist in the same file regardless of mode)
- See also: [[plans/phase-08-block-refs]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Intra-document block reference resolution and completion | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/block-references]] | `Intra-document block ref resolves in source doc` |
| [[bdd/features/block-references]] | `Completion after [[#^ returns current doc anchors` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/__tests__/block-ref-resolver.test.ts` | Unit | — | 🔴 failing |
| `tests/unit/completion/block-ref-completion-provider.spec.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-089]] — cross-doc block ref completion provider must exist before the intra-doc path is added to it

**Unblocks:**

- [[tickets/TASK-091]] — unit tests cover both intra-doc and cross-doc paths

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
