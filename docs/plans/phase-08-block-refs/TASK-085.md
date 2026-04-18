---
id: "TASK-085"
title: "Implement block ref resolution in LinkResolver"
type: task
status: done
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-084"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-085"]
---

# Implement block ref resolution in LinkResolver

> [!INFO] `TASK-085` · Task · Phase 8 · Parent: [[FEAT-009]] · Status: `open`

## Description

Update `LinkResolver.resolveWikiLink()` to handle `WikiLinkEntry` objects that carry a `blockId` field. The resolver must distinguish intra-document refs (where `entry.target` is empty) from cross-document refs, look up the `BlockAnchorEntry` in the appropriate document's `OFMIndex`, and record the result as a `CrossBlockRef` in `RefGraph`. A missing anchor yields an FG005 diagnostic; a missing target document yields the existing FG001 from the wiki-link resolver.

---

## Implementation Notes

- Resolution algorithm:
  1. If `entry.blockId` is set → this is a block reference
  2. If `entry.target === ''` (intra-doc) → look up anchor in source doc's `OFMIndex`
  3. If `entry.target` is non-empty → resolve target doc first, then look up anchor in that doc's `OFMIndex`
  4. Anchor not found → `CrossBlockRef.diagnostic = 'FG005'`
- Do not emit FG001 from this path — FG001 handling for missing target doc remains in the existing wiki-link resolution path
- See also: [[plans/phase-08-block-refs]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block ref cross-document and intra-document resolution | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/block-references.feature` | `Cross-document block ref resolves to anchor` |
| `bdd/features/block-references.feature` | `Intra-document block ref resolves in source doc` |
| `bdd/features/block-references.feature` | `Missing anchor emits FG005` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/__tests__/block-ref-resolver.test.ts` | Unit | — | 🔴 failing |

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

- [[TASK-084]] — `CrossBlockRef` type must exist in `RefGraph` before `LinkResolver` can write to it

**Unblocks:**

- [[TASK-086]] — `DiagnosticService` reads FG005 from the resolved `CrossBlockRef`
- [[TASK-087]] — `DefinitionService` reads `resolvedTo` from the `CrossBlockRef`
- [[TASK-089]] — block ref completion provider relies on resolved target doc

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
