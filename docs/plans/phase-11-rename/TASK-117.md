---
id: "TASK-117"
title: "Write integration tests for rename"
type: task
status: done
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-110", "TASK-111"]
tags: [tickets/task, "phase/11"]
aliases: ["TASK-117"]
---

# Write integration tests for rename

> [!INFO] `TASK-117` · Task · Phase 11 · Parent: [[tickets/FEAT-012]] · Status: `open`

## Description

Create `src/test/integration/rename.test.ts` using a fixture vault containing: a document with two headings (one with references, one orphaned); three documents that link to various headings; one document with pipe-aliased links. Assert the exact `WorkspaceEdit` structure returned for heading rename, file rename, zero-reference rename, and opaque region rejection. The test suite serves as the phase gate for Phase 11.

---

## Implementation Notes

- Test file: `src/test/integration/rename.test.ts`
- Smoke test doc: `tests/integration/smoke-rename.md`
- Fixture vault must include:
  - One document with two headings: one referenced by multiple docs, one orphaned
  - Three documents linking to the referenced heading
  - One document with pipe-aliased links (both identical and non-identical alias cases)
- Assert exact `WorkspaceEdit` — check `changes` or `documentChanges` field, URI keys, and `TextEdit` ranges
- Cover: heading rename, file rename, zero-reference rename, pipe alias handling, opaque region rejection
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
| [[bdd/features/rename]] | All rename scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |
| `tests/integration/smoke-rename.md` | Fixture | — | — |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding constraints that integration tests must exercise |
| [[adr/ADR013-vault-root-confinement]] | File rename URIs must remain within vault root |

---

## Parent Feature

[[tickets/FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-110]] — heading rename must be complete before integration tests can pass
- [[tickets/TASK-111]] — file rename must be complete before integration tests can pass

**Unblocks:**

- Nothing — this is the final task in Phase 11

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
- [ ] `bun test tests/integration/rename.test.ts` passes with no failures

---

## Notes

Use exact `WorkspaceEdit` assertions — not partial matchers. The fixture vault structure must be documented in a comment at the top of the test file so future contributors understand the expected link graph.

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
