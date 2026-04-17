---
id: "TASK-043"
title: "Write unit tests for parser sub-components"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-031", "TASK-032", "TASK-033", "TASK-034", "TASK-035", "TASK-036", "TASK-037", "TASK-038", "TASK-039", "TASK-040", "TASK-041"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-043"]
---

# Write unit tests for parser sub-components

> [!INFO] `TASK-043` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Consolidate and complete the unit test suite for all Phase 3 parser sub-components. Individual tasks (TASK-031 through TASK-041) each create a test file as part of the TDD red-green cycle. This task performs a final review pass to ensure full coverage of edge cases identified in the phase plan, adds any missing test cases, and verifies that the integration test in `ofm-parser.integration.test.ts` exercises the full pipeline against the sample vault fixture. All tests must be under `src/parser/__tests__/` as specified by the phase plan.

---

## Implementation Notes

- Target test files (one per parser class):
  - `src/parser/__tests__/frontmatter-parser.test.ts`
  - `src/parser/__tests__/wiki-link-parser.test.ts`
  - `src/parser/__tests__/embed-parser.test.ts`
  - `src/parser/__tests__/block-anchor-parser.test.ts`
  - `src/parser/__tests__/tag-parser.test.ts`
  - `src/parser/__tests__/callout-parser.test.ts`
  - `src/parser/__tests__/opaque-region-marker.test.ts`
  - `src/parser/__tests__/ofm-parser.integration.test.ts`
- Integration test uses fixture directory: `src/test/fixtures/sample-vault/`
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Phase 3 gate: `bun test src/parser/` must pass | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Server indexes wiki-links in opened document` |
| [[bdd/features/tags]] | `Server indexes tags in opened document` |
| [[bdd/features/callouts]] | `Server indexes callouts in opened document` |
| [[bdd/features/frontmatter]] | `Server parses frontmatter from opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/frontmatter-parser.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/wiki-link-parser.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/embed-parser.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/block-anchor-parser.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/tag-parser.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/callout-parser.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/opaque-region-marker.test.ts` | Unit | — | 🔴 failing |
| `src/parser/__tests__/ofm-parser.integration.test.ts` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | Parser safety policy constrains what must be tested |

---

## Parent Feature

[[tickets/FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- All individual parser task tickets (TASK-031 through TASK-041) must be `done` (they each create the initial test file)

**Unblocks:**

- Phase 3 gate: `bun run gate:3` requires `bun test src/parser/` to pass

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `bun test src/parser/` passes with all tests green
- [ ] Every parser sub-component has at least one test for its primary happy path and at least one for its primary edge case
- [ ] `ofm-parser.integration.test.ts` passes with sample vault fixture
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] rows updated to `✅ passing` for all parser test files
- [ ] [[test/index]] rows confirmed for all parser test files
- [ ] Parent feature [[tickets/FEAT-004]] child task row updated to `in-review`

---

## Notes

The sample vault fixture should include at least one document of each type: frontmatter-only, wiki-link-heavy, tag-heavy, callout-heavy, and a document with nested opaque regions.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-004]].

> [!SUCCESS] Done — 2026-04-17
> Implemented and tested. All acceptance criteria met. Status: `done`.
