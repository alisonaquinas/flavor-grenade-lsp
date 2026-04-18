---
id: "TASK-104"
title: "Implement CodeLensProvider"
type: task
status: done
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/10"]
aliases: ["TASK-104"]
---

# Implement CodeLensProvider

> [!INFO] `TASK-104` · Task · Phase 10 · Parent: [[tickets/FEAT-011]] · Status: `open`

## Description

Create `src/handlers/code-lens.handler.ts`. Handle `textDocument/codeLens`: for each `HeadingEntry` in the document's `OFMIndex`, compute the `DefKey` for the heading, query `RefGraph.refsFor(defKey)` to count references, and produce a `CodeLens` object with title `"${count} reference(s)"` and command `editor.action.findReferences`. Return all `CodeLens[]` for the document. Headings with 0 references still get a code lens — `"0 references"`. Register `codeLensProvider: { resolveProvider: false }` in server capabilities.

---

## Implementation Notes

- Handler file: `src/handlers/code-lens.handler.ts`
- Pluralisation: `"1 reference"`, `"0 references"`, `"2 references"`
- CodeLens shape:

  ```typescript
  {
    range: heading.range,
    command: {
      title: `${count} reference${count !== 1 ? 's' : ''}`,
      command: 'editor.action.findReferences',
      arguments: [uri, heading.range.start],
    }
  }
  ```

- Register `codeLensProvider: { resolveProvider: false }` in capabilities — no resolve step needed
- See also: [[bdd/features/navigation]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/navigation]] | `Code lens shows reference count on heading with references` |
| [[bdd/features/navigation]] | `Code lens shows zero references on unreferenced heading` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/navigation.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding governs RefGraph key construction |

---

## Parent Feature

[[tickets/FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- Nothing — CodeLensProvider queries RefGraph directly and does not depend on entityAtPosition

**Unblocks:**

- [[tickets/TASK-108]] — integration tests cover code lens scenarios

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

`resolveProvider: false` means no second round-trip to resolve code lens data — all data must be computed in the initial `codeLens` request.

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
