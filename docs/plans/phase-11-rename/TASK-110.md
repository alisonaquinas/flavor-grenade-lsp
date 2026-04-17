---
id: "TASK-110"
title: "Implement textDocument/rename for heading rename"
type: task
status: open
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-109", "TASK-115"]
tags: [tickets/task, "phase/11"]
aliases: ["TASK-110"]
---

# Implement textDocument/rename for heading rename

> [!INFO] `TASK-110` · Task · Phase 11 · Parent: [[tickets/FEAT-012]] · Status: `open`

## Description

Create `src/handlers/rename.handler.ts` (or extend it) to handle heading rename. For heading rename: get `HeadingEntry` at cursor via `entityAtPosition()`; compute `defKey` for the heading; query `RefGraph.refsFor(defKey)` to get all `Ref[]`; build a `WorkspaceEdit` using `WorkspaceEditBuilder` — one change replacing the heading text in the source document (not the `##` prefix), plus one change per `Ref` replacing the heading fragment in each wiki-link. Preserve aliases unless the alias was identical to the old heading text (alias update rule is detailed in TASK-113).

---

## Implementation Notes

- Handler file: `src/handlers/rename.handler.ts`
- Uses `WorkspaceEditBuilder` (TASK-115) — that utility must exist first
- Heading text change: replace only the text after `##` prefix, not the prefix itself
- Reference changes: `[[doc#Old Heading]]` → `[[doc#New Heading]]`; `[[doc#Old Heading|alias]]` → `[[doc#New Heading|alias]]` (alias preserved)
- Alias-identity update rule is in TASK-113
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
| [[bdd/features/rename]] | `Rename heading updates source document` |
| [[bdd/features/rename]] | `Rename heading updates all cross-vault fragment references` |
| [[bdd/features/rename]] | `Rename heading preserves non-identical aliases` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding governs how fragment references are updated |

---

## Parent Feature

[[tickets/FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-109]] — prepareRename must exist first (validates the rename context)
- [[tickets/TASK-115]] — WorkspaceEditBuilder must exist before rename handler can produce WorkspaceEdit

**Unblocks:**

- [[tickets/TASK-112]] — link style variant handling extends heading rename
- [[tickets/TASK-113]] — pipe alias handling extends heading rename
- [[tickets/TASK-114]] — zero-reference rename extends heading rename
- [[tickets/TASK-117]] — integration tests depend on heading rename being complete

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

The heading text edit must not touch the `##` prefix. The range passed to `WorkspaceEditBuilder.addTextEdit` must start after the last `#` character and any following whitespace.

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
