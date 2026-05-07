---
id: "TASK-179"
title: "Add structural LSP tests"
type: task
status: open
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-176", "TASK-177", "TASK-178"]
tags: [tickets/task, "phase/17"]
aliases: ["TASK-179"]
---

# Add structural LSP tests

> [!INFO] `TASK-179` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `open`

## Description

Add the Phase 17 integration and BDD trace coverage that proves document links, folding ranges, and selection ranges work together on representative OFMarkdown documents. This is the phase gate for `Parity.StructuralLSP.Coverage` after the focused handler tests have already supplied RED/GREEN evidence for the individual handlers.

---

## Implementation Notes

- Cover a document containing frontmatter, headings, callouts, code fences, math blocks, comments, Templater regions, wiki-links, embeds, attachments, and block anchors
- Include ambiguous link cases where document links intentionally omit targets
- Include opaque-region cases where folding and selection ranges must not cross boundaries
- Add BDD scenarios or step coverage only where the existing feature files do not already express the Phase 17 behavior
- Use `src/test/integration/structural-lsp.test.ts` for spawned-server structural request coverage
- See also: [[test/matrix]], [[test/index]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.Coverage` | Representative structural LSP constructs must be covered by tests | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.DocumentLinks` | Document-link behavior is covered by unit and integration tests | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.FoldingRanges` | Folding-range behavior is covered by unit and integration tests | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.SelectionRanges` | Selection-range behavior is covered by unit and integration tests | [[requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Document link targets match existing resolution behavior | [[requirements/navigation]] |
| `ST-002` | Opaque region boundaries are test-covered | [[requirements/semantic-tokens]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Structural LSP capability meter for document links, folding ranges, and selection ranges |
| `docs/bdd/features/navigation.feature` | Go-to-definition on `[[doc]]` navigates to target document |
| `docs/bdd/features/frontmatter.feature` | Empty frontmatter block with no keys is parsed without error |
| `docs/bdd/features/callouts.feature` | Nested callout at depth 2 is detected |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/test/integration/structural-lsp.test.ts` | Integration | `Parity.StructuralLSP.Coverage` | planned |
| `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | BDD | `Parity.StructuralLSP.Coverage` | planned |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| - | N/A |

---

## Parent Feature

[[FEAT-024]] - Structural LSP Capabilities

---

## Dependencies

**Blocked by:**

- [[TASK-176]] - documentLink behavior must exist before integrated tests can pass
- [[TASK-177]] - foldingRange behavior must exist before integrated tests can pass
- [[TASK-178]] - selectionRange behavior must exist before integrated tests can pass
- [[TASK-213]] - Templater regions must be opaque before full structural coverage can be claimed

**Unblocks:**

- [[CHORE-054]] - test matrix sweep can verify final Phase 17 rows after this task

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Integration or BDD coverage added after the focused handler RED/GREEN tasks
- [ ] Any newly exposed behaviour gap is ticketed before it is fixed
- [ ] Phase 17 structural integration tests cover all acceptance constructs
- [ ] Phase 17 BDD trace exists for `Parity.StructuralLSP.Coverage`
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-024]] child task row updated to `in-review`

---

## Notes

Run this after the three structural handlers and Templater opaque-region support
exist. Keep tests representative rather than exhaustive parser duplication. If
new integration tests pass immediately because earlier RED/GREEN handler tasks
already implemented the behavior, record that as coverage evidence instead of
manufacturing a failing test.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-024]].
