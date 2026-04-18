---
id: "TASK-066"
title: "Write TDD integration tests for multi-document vault"
type: task
status: done
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-065"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-066"]
---

# Write TDD integration tests for multi-document vault

> [!INFO] `TASK-066` · Task · Phase 5 · Parent: [[FEAT-006]] · Status: `open`

## Description

Create integration tests for Phase 5 using a multi-document vault fixture. The fixture vault at `src/test/fixtures/wiki-link-vault/` must contain at least five documents with various link patterns, one document with aliases, one ambiguous stem (two files with the same stem in different folders), and one broken link. Integration tests in `src/test/integration/wiki-links.test.ts` verify end-to-end: server initialisation, `awaitIndexReady`, resolution, diagnostics, definition, references, and completion — all against the real vault fixture without mocking internal services.

---

## Implementation Notes

- Fixture vault structure at `src/test/fixtures/wiki-link-vault/`:
  - 5 documents with various link patterns
  - 1 document with `frontmatter.aliases`
  - 2 files with identical stems in different folders (ambiguous case)
  - 1 document containing a broken wiki-link
- Test file: `src/test/integration/wiki-links.test.ts`
- Tests must use `flavorGrenade/awaitIndexReady` before any assertion to avoid race conditions
- See also: [[adr/ADR005-wiki-style-binding]], [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Integration test requirements | [[requirements/wiki-link-resolution]] |
| — | End-to-end diagnostics requirements | [[requirements/diagnostics]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/wiki-links.feature` | All wiki-links.feature scenarios |
| `bdd/features/diagnostics.feature` | FG001, FG002, FG003 scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/wiki-links.test.ts` | Integration | — | 🔴 failing |
| `tests/integration/smoke-wiki-links.md` | Integration test plan | — | — |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Integration tests must cover all three link styles |
| [[adr/ADR003-vault-detection]] | Fixture vault must include a valid vault marker (.obsidian/) |

---

## Parent Feature

[[FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[TASK-065]] — all handlers must be registered before integration tests can exercise them end-to-end

**Unblocks:**

- Nothing — this is the final implementation task for Phase 5

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
- [ ] Parent feature [[FEAT-006]] child task row updated to `in-review`

---

## Notes

The fixture vault must include a `.obsidian/` directory so `VaultDetector` enters full vault mode. Integration tests are end-to-end and must not mock `VaultIndex`, `FolderLookup`, or `RefGraph` — they exercise the entire stack.

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
> Ticket created. Status: `open`. Parent: [[FEAT-006]].
