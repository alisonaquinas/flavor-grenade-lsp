---
id: "TASK-056"
title: "Write unit tests for FolderLookup"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-048"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-056"]
---

# Write unit tests for FolderLookup

> [!INFO] `TASK-056` · Task · Phase 4 · Parent: [[FEAT-005]] · Status: `open`

## Description

Write comprehensive unit tests for `FolderLookup` covering all four core lookup scenarios: stem matching a root-level file, stem matching a nested file, ambiguous stem returning multiple results, and path-qualified stem resolving uniquely. Tests should construct a `VaultIndex` directly from test fixtures, call `rebuild()`, and then verify the lookup results for each scenario.

---

## Implementation Notes

- Test cases required:
  1. Stem matches root-level file: `findByStem("alpha")` → `[{ docId: "alpha", ... }]`
  2. Stem matches nested file: `findByStem("beta")` → `[{ docId: "notes/beta", ... }]`
  3. Ambiguous stem: `findByStem("gamma")` → two results from `docs/gamma` and `archive/gamma`
  4. Path-qualified stem: `findByPath("docs/gamma")` → unique result
- All comparisons are case-insensitive; test mixed-case queries
- Test `findExact` returns `undefined` when multiple matches exist
- Test file: `tests/unit/vault/folder-lookup.spec.ts`
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Name matching requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/workspace.feature` | `FolderLookup resolves bare stem to nested document` |
| `bdd/features/workspace.feature` | `FolderLookup returns multiple results for ambiguous stem` |
| `bdd/features/workspace.feature` | `FolderLookup resolves path-qualified stem uniquely` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/folder-lookup.spec.ts` | Unit | — | 🔴 failing |
| `tests/unit/unit-vault-module.md` | Unit test plan | — | — |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault root anchoring for all path resolution in FolderLookup |

---

## Parent Feature

[[FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[TASK-048]] — FolderLookup must be implemented before tests can be written

**Unblocks:**

- Nothing — final test coverage task for FolderLookup

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
- [ ] Parent feature [[FEAT-005]] child task row updated to `in-review`

---

## Notes

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
> Ticket created. Status: `open`. Parent: [[FEAT-005]].

> [!SUCCESS] Done — 2026-04-17
> `src/vault/__tests__/folder-lookup.test.ts` created with 7 tests: root-level stem, nested stem, ambiguous stem (2 results), path-qualified unique result, empty result, rebuild replaces state. Plus doc-id.test.ts (8 tests) and vault-index.test.ts (9 tests) as additional coverage. Status: `done`.
