---
id: "TASK-109"
title: "Implement textDocument/prepareRename"
type: task
status: done
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/11"]
aliases: ["TASK-109"]
---

# Implement textDocument/prepareRename

> [!INFO] `TASK-109` · Task · Phase 11 · Parent: [[tickets/FEAT-012]] · Status: `open`

## Description

Create `src/handlers/prepare-rename.handler.ts`. Called before `textDocument/rename` to validate the cursor position. Use `entityAtPosition()` to find what is at the cursor: heading → return `{ range, placeholder }` where `range` covers the heading text (not the `##` prefix) and `placeholder` is the heading text; wiki-link that resolves unambiguously → return range of the link text; none or in an opaque region (math, code, comment) → return error response `{ error: { code: -32602, message: 'Cannot rename at this location' } }`.

---

## Implementation Notes

- Handler file: `src/handlers/prepare-rename.handler.ts`
- Uses `entityAtPosition` from Phase 10 (TASK-105)
- Heading range must exclude `##` prefix — only the heading text is the rename target
- Opaque region check: `OFMDoc.opaqueRegions` (code block, math block, comment) — handled in TASK-116, which extends this handler
- Error code `-32602` is the LSP `InvalidParams` code
- ADR constraint: [[adr/ADR005-wiki-style-binding]]
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
| [[bdd/features/rename]] | `prepareRename returns range and placeholder for heading` |
| [[bdd/features/rename]] | `prepareRename returns range for wiki-link` |
| [[bdd/features/rename]] | `prepareRename returns error for plain text` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding governs what can be renamed and how ranges are computed |

---

## Parent Feature

[[tickets/FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- Nothing — uses entityAtPosition from Phase 10 infrastructure (already done)

**Unblocks:**

- [[tickets/TASK-116]] — opaque region rejection extends prepareRename

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

The `range` returned must exactly cover the heading text — the client uses this to pre-fill the rename input box with `placeholder`. An incorrect range causes the editor to highlight the wrong text.

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
