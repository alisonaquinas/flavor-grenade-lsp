---
id: "TASK-087"
title: "Implement go-to-definition for block refs"
type: task
status: done
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-085"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-087"]
---

# Implement go-to-definition for block refs

> [!INFO] `TASK-087` · Task · Phase 8 · Parent: [[FEAT-009]] · Status: `open`

## Description

Update `DefinitionService` to handle `textDocument/definition` requests where the cursor falls on a `WikiLinkEntry` with a `blockId` field. The service resolves the corresponding `CrossBlockRef`, reads the `BlockAnchorEntry.range` from the resolved entry, and returns a `Location` pointing at the `^anchor-id` text in the target document. When the anchor is in the same document (intra-doc), the target URI equals the source URI.

---

## Implementation Notes

- Entry point: `DefinitionService.getDefinition(params)`
- Check if the `WikiLinkEntry` at cursor has `blockId` set
- Look up the `CrossBlockRef` in `RefGraph` for this entry
- If `resolvedTo` is non-null: return `Location { uri: targetDoc.uri, range: anchorEntry.range }`
- The cursor should land on the `^anchor-id` text itself (use `BlockAnchorEntry.range`, not `lineRange`)
- If `resolvedTo` is null: return null (no definition available; FG005 will already be reported)
- See also: [[plans/phase-08-block-refs]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Go-to-definition for block references | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/block-references.feature` | `Go-to-definition on block ref navigates to anchor` |
| `bdd/features/block-references.feature` | `Go-to-definition on intra-doc block ref stays in same file` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/services/definition-service.spec.ts` | Unit | — | 🔴 failing |

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

- [[TASK-085]] — `LinkResolver` must have populated `CrossBlockRef.resolvedTo` before `DefinitionService` can read it

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
