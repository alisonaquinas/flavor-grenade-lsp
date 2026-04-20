---
id: "TASK-108"
title: "Write integration tests for navigation"
type: task
status: done
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-102", "TASK-103"]
tags: [tickets/task, "phase/10"]
aliases: ["TASK-108"]
---

# Write integration tests for navigation

> [!INFO] `TASK-108` · Task · Phase 10 · Parent: [[FEAT-011]] · Status: `open`

## Description

Create `src/test/integration/navigation.test.ts` using a fixture vault with a known link graph. Assert exact `Location` objects returned by the definition and references handlers across all cursor position cases. The test suite serves as the phase gate for Phase 10 and must cover all scenarios defined in the linked BDD feature file.

---

## Implementation Notes

- Test file: `src/test/integration/navigation.test.ts`
- Smoke test doc: `tests/integration/smoke-navigation.md`
- Use a fixture vault with controlled, predictable link structure
- Assert exact `Location` objects (uri, range) — do not use partial matchers
- Cover: definition, references, code lens, and document highlight handlers
- Tests should be written in TDD order: write the failing test first, then implement the handler
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
| `bdd/features/navigation.feature` | All navigation scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/navigation.test.ts` | Integration | — | 🔴 failing |
| `tests/integration/smoke-navigation.md` | Fixture | — | — |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding constraints that integration tests must exercise |

---

## Parent Feature

[[FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- [[TASK-102]] — DefinitionService must be complete before integration tests can pass
- [[TASK-103]] — ReferencesService must be complete before integration tests can pass

**Unblocks:**

- Nothing — this is the final task in Phase 10

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
- [ ] `bun test tests/integration/navigation.test.ts` passes with no failures

---

## Notes

The fixture vault must have enough documents to exercise all link types and entity types. Avoid relying on real vault content — use a dedicated test fixture directory.

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
