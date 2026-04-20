---
id: "TASK-088"
title: "Implement find-references for block anchors"
type: task
status: done
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-084"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-088"]
---

# Implement find-references for block anchors

> [!INFO] `TASK-088` · Task · Phase 8 · Parent: [[FEAT-009]] · Status: `open`

## Description

Update `ReferencesService` to handle `textDocument/references` requests where the cursor sits on a `^blockid` anchor token. The service finds the `BlockAnchorEntry` at the cursor position in the source document's `OFMIndex`, then queries `RefGraph` for all `CrossBlockRef` entries whose `resolvedTo` matches this anchor's `DefKey`, and returns each referencing `WikiLinkEntry` location as a `Location[]`.

---

## Implementation Notes

- Detection: check if cursor falls within a `BlockAnchorEntry.range` in the source doc's `OFMIndex`
- If found: build a `DefKey` from the anchor and query `RefGraph.crossBlockRefs` for all entries where `resolvedTo.id === anchor.id` and the source doc matches
- Return each referencing `entry` location: `Location { uri: sourceDoc.uri, range: entry.range }`
- Include or exclude the anchor's own declaration based on the `includeDeclaration` flag in the request params
- See also: [[plans/phase-08-block-refs]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Find-references for block anchor definitions | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/block-references.feature` | `Find-references on block anchor returns all referencing locations` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/services/references-service.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR006-block-ref-indexing]] | Block anchor ID format and indexing strategy |

---

## Parent Feature

[[FEAT-009]] — Block References

---

## Dependencies

**Blocked by:**

- [[TASK-084]] — `CrossBlockRef` entries must be in `RefGraph` before `ReferencesService` can query them

**Unblocks:**

- None within Phase 8

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
- [ ] Parent feature [[FEAT-009]] child task row updated to `in-review`

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
> Ticket created. Status: `open`. Parent: [[FEAT-009]].
