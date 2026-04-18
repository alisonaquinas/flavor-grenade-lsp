---
id: "TASK-074"
title: "Write unit tests for TagRegistry"
type: task
status: done
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-067"]
tags: [tickets/task, "phase/6"]
aliases: ["TASK-074"]
---

# Write unit tests for TagRegistry

> [!INFO] `TASK-074` · Task · Phase 6 · Parent: [[tickets/FEAT-007]] · Status: `open`

## Description

Create `src/tags/__tests__/tag-registry.test.ts` containing the full unit test suite for `TagRegistry`. Tests must be written first (TDD red phase) before the corresponding implementation is considered done. The test file covers all core behaviours of the registry and forms the evidence base for the Phase 6 gate.

---

## Implementation Notes

- Test file: `src/tags/__tests__/tag-registry.test.ts`
- Required test cases:
  - Inline tag indexed with correct document ID and character range
  - Frontmatter tag indexed with correct document ID and `source: 'frontmatter'`
  - Tag inside a fenced code block NOT indexed
  - Tag inside a math block NOT indexed
  - Nested tag hierarchy built correctly by `hierarchy()`
  - `withPrefix()` returns the correct subset of tags for a given prefix
- See also: [[tests/unit/unit-vault-module.md]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | TagRegistry unit test coverage | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/tags]] | `TagRegistry correctly excludes code block tags` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-vault-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Tag handling and exclusion rules follow OFM spec |

---

## Parent Feature

[[tickets/FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-067]] — TagRegistry must exist (even as a stub) for tests to compile

**Unblocks:**

- None within Phase 6

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
- [ ] Parent feature [[tickets/FEAT-007]] child task row updated to `in-review`

---

## Notes

All six test cases listed in the Phase 6 plan must be present. The tests are the gate evidence for `bun test src/tags/`.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-007]].

> [!SUCCESS] Done — 2026-04-17
> Implemented in GREEN commit 2af7882. All 225 tests pass; lint and tsc clean. Status: `done`.
