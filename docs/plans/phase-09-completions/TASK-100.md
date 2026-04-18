---
id: "TASK-100"
title: "Implement intra-document block ref completion after [[#^"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-092"]
tags: [tickets/task, "phase/9"]
aliases: ["TASK-100"]
---

# Implement intra-document block ref completion after [[#^

> [!INFO] `TASK-100` · Task · Phase 9 · Parent: [[tickets/FEAT-010]] · Status: `open`

## Description

Implement completion for intra-document block references triggered after `[[#^` (no target document stem). When `ContextAnalyzer` returns `{ kind: 'wiki-link-block', targetStem: '' }`, the completion router dispatches to the block ref provider which enumerates `BlockAnchorEntry[]` from the current document's `OFMIndex`. No `Oracle` call is needed — the current doc is used directly.

---

## Implementation Notes

- Trigger context: `{ kind: 'wiki-link-block', targetStem: '', anchorPrefix }`
- When `targetStem === ''`: enumerate `currentDoc.ofmIndex.blockAnchors`, filter by `anchorPrefix`
- Item shape: `{ label: anchor.id, kind: CompletionItemKind.Reference, insertText: anchor.id }`
- The cross-doc path for `[[doc#^` was already implemented in Phase 8 (TASK-089/TASK-090); this task wires the intra-doc case into the unified router
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Intra-document block ref completion after [[#^ | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/completions]] | `Intra-doc block ref completion after [[#^ returns current doc anchors` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/completion-router.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[tickets/FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-092]] — `CompletionRouter` must exist to route the intra-doc `wiki-link-block` context

**Unblocks:**

- None within Phase 9

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
- [ ] Parent feature [[tickets/FEAT-010]] child task row updated to `in-review`

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-010]].

> [!SUCCESS] Done — 2026-04-17
> Implementation complete and tested. All acceptance criteria met. Lint clean, tsc clean, 321 tests pass. Status: `done`.
