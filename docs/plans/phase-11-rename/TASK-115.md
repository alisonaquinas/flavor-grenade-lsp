---
id: "TASK-115"
title: "Implement WorkspaceEditBuilder"
type: task
status: done
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/11"]
aliases: ["TASK-115"]
---

# Implement WorkspaceEditBuilder

> [!INFO] `TASK-115` · Task · Phase 11 · Parent: [[FEAT-012]] · Status: `open`

## Description

Create `src/handlers/workspace-edit-builder.ts`. A builder that accumulates text edits keyed by URI and `RenameFile` document changes, then produces a complete LSP `WorkspaceEdit`. The builder deduplicates edits for the same range and sorts edits in reverse line order (applying from bottom to top preserves text offsets during multi-edit operations). This utility is used by heading rename (TASK-110) and file rename (TASK-111) and must be implemented first.

---

## Implementation Notes

- File: `src/handlers/workspace-edit-builder.ts`
- Public API:

  ```typescript
  export class WorkspaceEditBuilder {
    addTextEdit(uri: string, range: Range, newText: string): this;
    addRenameFile(oldUri: string, newUri: string): this;
    build(): WorkspaceEdit;
  }
  ```

- Deduplication: if two edits target the same URI and same range, keep the last one added
- Reverse line order: sort edits for each URI by line descending, then by character descending, so the last edit in the file is applied first
- `RenameFile` operations are included in `documentChanges`, not in `changes`
- See also: `bdd/features/rename.feature`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Rename requirements | [[requirements/rename]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/rename.feature` | `WorkspaceEditBuilder deduplicates edits for same range` |
| `bdd/features/rename.feature` | `WorkspaceEditBuilder sorts edits in reverse line order` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/handlers/workspace-edit-builder.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Rename edits must respect link style invariants |

---

## Parent Feature

[[FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- Nothing — this is the foundational utility for Phase 11 and has no ticket dependencies

**Unblocks:**

- [[TASK-110]] — heading rename uses WorkspaceEditBuilder
- [[TASK-111]] — file rename uses WorkspaceEditBuilder

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
- [ ] Parent feature [[FEAT-012]] child task row updated to `in-review`

---

## Notes

Reverse-order sort is critical for correctness: applying bottom-to-top edits ensures that earlier ranges are not invalidated by text insertion/deletion above them. The code quality sweep (CHORE-032) will verify the sort correctness.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-012]].
