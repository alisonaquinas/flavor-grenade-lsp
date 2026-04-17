---
id: "TASK-103"
title: "Consolidate ReferencesService"
type: task
status: open
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-105"]
tags: [tickets/task, "phase/10"]
aliases: ["TASK-103"]
---

# Consolidate ReferencesService

> [!INFO] `TASK-103` · Task · Phase 10 · Parent: [[tickets/FEAT-011]] · Status: `open`

## Description

Ensure `textDocument/references` handles all entity types at cursor: heading → all `[[doc#Heading]]` links across vault; block anchor → all `[[doc#^block-anchor]]` links across vault; tag → all `#tag` occurrences via `TagRegistry`; document title (`# Title`) → all `[[docname]]` links; wiki-link → return the definition location (go-to-def reverse); plain text → return `[]`. The `includeDeclaration` parameter must be respected: `true` prepends the definition location to results; `false` returns only references (linkers), not the defined entity.

---

## Implementation Notes

- Use `entityAtPosition` (TASK-105) — that utility must exist before this task begins
- `includeDeclaration: true` — prepend the definition location (e.g. the heading line itself)
- `includeDeclaration: false` — return only refs, not the declaration site
- Tag lookup goes through `TagRegistry`
- Return `[]` (empty array, not null) for plain text
- See also: [[design/navigation]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/navigation]] | `Find references for heading` |
| [[bdd/features/navigation]] | `Find references for block anchor` |
| [[bdd/features/navigation]] | `Find references for tag` |
| [[bdd/features/navigation]] | `Find references for document title` |
| [[bdd/features/navigation]] | `Find references for wiki-link returns definition` |
| [[bdd/features/navigation]] | `Find references returns empty for plain text` |
| [[bdd/features/navigation]] | `includeDeclaration true prepends definition` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/navigation.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding rules govern how cursor entities are resolved |

---

## Parent Feature

[[tickets/FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-105]] — entityAtPosition utility must exist before ReferencesService can use it

**Unblocks:**

- [[tickets/TASK-108]] — integration tests depend on ReferencesService being complete

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
- [ ] Parent feature [[tickets/FEAT-011]] child task row updated to `in-review`

---

## Notes

The `includeDeclaration` flag is a core LSP concern and must be handled correctly — omitting it causes incorrect results in editors that rely on it to deduplicate entries.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-011]].
