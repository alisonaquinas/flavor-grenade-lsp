---
id: "TASK-089"
title: "Implement block ref completion"
type: task
status: open
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-085"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-089"]
---

# Implement block ref completion

> [!INFO] `TASK-089` · Task · Phase 8 · Parent: [[tickets/FEAT-009]] · Status: `open`

## Description

Create `src/completion/block-ref-completion-provider.ts`. This provider is triggered after `[[doc#^` and offers completions for block anchor IDs in the target document. It parses the partial text before the cursor to extract the target document stem, resolves the target document via `Oracle`, enumerates `BlockAnchorEntry[]` from that doc's `OFMIndex`, and returns `CompletionItem[]` with `label: anchorEntry.id` and `kind: CompletionItemKind.Reference`. If the target document cannot be resolved, the provider returns an empty list.

---

## Implementation Notes

- Trigger: text ending with `[[<stem>#^` before cursor
- Extract `stem` from between `[[` and `#^`
- Resolve target doc via `Oracle.resolveByFolderLookup(stem)`
- If resolved: `return doc.ofmIndex.blockAnchors.map(a => ({ label: a.id, kind: CompletionItemKind.Reference }))`
- If not resolved: `return []`
- Cross-doc only; intra-doc `[[#^` case is handled in TASK-090
- See also: [[plans/phase-08-block-refs]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block ref completion after [[doc#^ | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/block-references]] | `Completion after [[doc#^ returns anchors from target doc` |
| [[bdd/features/block-references]] | `Completion returns empty list when target doc unresolved` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
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

- [[tickets/TASK-085]] — target doc resolution logic in `LinkResolver` must be available before completion can reuse the same resolution path

**Unblocks:**

- [[tickets/TASK-090]] — intra-doc completion builds on this provider

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
