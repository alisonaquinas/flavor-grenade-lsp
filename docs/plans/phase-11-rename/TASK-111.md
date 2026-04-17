---
id: "TASK-111"
title: "Implement textDocument/rename for file rename"
type: task
status: open
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-115"]
tags: [tickets/task, "phase/11"]
aliases: ["TASK-111"]
---

# Implement textDocument/rename for file rename

> [!INFO] `TASK-111` · Task · Phase 11 · Parent: [[tickets/FEAT-012]] · Status: `open`

## Description

Handle file rename in the rename handler. Determine the old `DocId` from the current document's URI; query `RefGraph` for all refs targeting this `DocId`; build a `WorkspaceEdit` using `WorkspaceEditBuilder` with a `RenameFile` document change (`{ kind: 'rename', oldUri, newUri }`) and text edits in all referencing documents updating: `[[old-stem]]` → `[[new-stem]]`, `[[old-stem|alias]]` → `[[new-stem|alias]]`, `[[old-stem#heading]]` → `[[new-stem#heading]]`, and `[[folder/old-stem]]` → `[[folder/new-stem]]` (path-qualified links). Return the completed `WorkspaceEdit`.

---

## Implementation Notes

- Extends `src/handlers/rename.handler.ts`
- Uses `WorkspaceEditBuilder.addRenameFile(oldUri, newUri)` and `addTextEdit` — TASK-115 must exist first
- `RenameFile` operation: `{ kind: 'rename', oldUri: string, newUri: string }`
- All four link pattern variants must be updated
- Path-qualified links: preserve path prefix, only update the stem
- New URI must remain within vault root — verified in CHORE-033
- See also: [[bdd/features/rename]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Rename requirements | [[requirements/rename]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/rename]] | `Rename file produces RenameFile document change` |
| [[bdd/features/rename]] | `Rename file updates plain wiki-link references` |
| [[bdd/features/rename]] | `Rename file updates aliased wiki-link references` |
| [[bdd/features/rename]] | `Rename file updates heading-fragment references` |
| [[bdd/features/rename]] | `Rename file updates path-qualified references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Link style variants must be preserved, not converted, during rename |
| [[adr/ADR013-vault-root-confinement]] | New file URIs must remain within vault root |

---

## Parent Feature

[[tickets/FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-115]] — WorkspaceEditBuilder must exist before rename handler can produce WorkspaceEdit

**Unblocks:**

- [[tickets/TASK-112]] — link style variant handling extends file rename
- [[tickets/TASK-117]] — integration tests depend on file rename being complete

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
- [ ] Parent feature [[tickets/FEAT-012]] child task row updated to `in-review`

---

## Notes

The `RenameFile` operation must come first in `documentChanges` so that editors apply the file rename before processing text edits in the newly-renamed file.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-012]].
