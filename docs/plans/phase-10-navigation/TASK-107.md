---
id: "TASK-107"
title: "Implement textDocument/documentHighlight"
type: task
status: done
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-105"]
tags: [tickets/task, "phase/10"]
aliases: ["TASK-107"]
---

# Implement textDocument/documentHighlight

> [!INFO] `TASK-107` · Task · Phase 10 · Parent: [[FEAT-011]] · Status: `open`

## Description

Create `src/handlers/document-highlight.handler.ts`. When the cursor is on a wiki-link or heading, highlight all references to the same entity within the current document only. Use `DocumentHighlightKind.Write` for the definition (heading line, block anchor) and `DocumentHighlightKind.Read` for all references within the same file. Register `documentHighlightProvider: true` in server capabilities.

---

## Implementation Notes

- Handler file: `src/handlers/document-highlight.handler.ts`
- Scope: current document only — cross-file highlights are not part of this task
- `DocumentHighlightKind.Write` (2) = definition site (heading line, block anchor definition)
- `DocumentHighlightKind.Read` (1) = reference site (any wiki-link within same doc pointing to that entity)
- Uses `entityAtPosition` (TASK-105) to determine what is under the cursor
- Register `documentHighlightProvider: true` in capabilities
- See also: `bdd/features/navigation.feature`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/navigation.feature` | `Document highlight marks definition as Write and references as Read` |
| `bdd/features/navigation.feature` | `Document highlight returns empty when cursor on plain text` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/navigation.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding governs entity resolution |

---

## Parent Feature

[[FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- [[TASK-105]] — entityAtPosition utility must exist before DocumentHighlight can use it

**Unblocks:**

- [[TASK-108]] — integration tests cover document highlight scenarios

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
- [ ] Parent feature [[FEAT-011]] child task row updated to `in-review`

---

## Notes

Only intra-document highlights are in scope. Cross-document highlights would require a different LSP method.

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
> Ticket created. Status: `open`. Parent: [[FEAT-011]].
