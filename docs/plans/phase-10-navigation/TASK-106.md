---
id: "TASK-106"
title: "Handle multi-location definition results"
type: task
status: done
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-102"]
tags: [tickets/task, "phase/10"]
aliases: ["TASK-106"]
---

# Handle multi-location definition results

> [!INFO] `TASK-106` · Task · Phase 10 · Parent: [[tickets/FEAT-011]] · Status: `open`

## Description

For ambiguous links (FG002 candidates — where a wiki-link matches more than one document), go-to-definition must return `LocationLink[]` instead of a single `Location`. Each `LocationLink` includes an `originSelectionRange` covering the wiki-link text in the source document, enabling editors to present a choice list to the user. This task extends the DefinitionService built in TASK-102.

---

## Implementation Notes

- Use `LocationLink[]` response shape, not `Location`, for multi-candidate results
- `LocationLink` shape:

  ```typescript
  {
    originSelectionRange: wikiLinkEntry.range,
    targetUri: candidate.uri,
    targetRange: candidate.range,
    targetSelectionRange: candidate.range,
  }
  ```

- FG002 diagnostic is the signal that a link is ambiguous — consult that diagnostics logic
- Single-candidate results may still use `Location[]` for backward compatibility
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/navigation]] | `Go to definition returns LocationLink array for ambiguous link` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/navigation.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Ambiguous link (FG002) resolution rules |

---

## Parent Feature

[[tickets/FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-102]] — DefinitionService must exist before multi-location behaviour can be layered on top

**Unblocks:**

- [[tickets/TASK-108]] — integration tests cover multi-location scenarios

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

`originSelectionRange` must be within the bounds of the current document. The security sweep (CHORE-030) will verify this invariant.

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
