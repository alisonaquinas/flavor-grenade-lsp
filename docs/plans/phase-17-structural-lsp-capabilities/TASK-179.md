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

Add the Phase 17 test coverage that proves document links, folding ranges, and selection ranges work together on representative OFMarkdown documents. This is the phase gate for `Parity.StructuralLSP.Coverage`.

---

## Implementation Notes

- Cover a document containing frontmatter, headings, callouts, code fences, math blocks, comments, wiki-links, embeds, attachments, and block anchors
- Include ambiguous link cases where document links intentionally omit targets
- Include opaque-region cases where folding and selection ranges must not cross boundaries
- Add BDD scenarios or step coverage only where the existing feature files do not already express the Phase 17 behavior
- See also: [[test/matrix]], [[test/index]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.Coverage` | Representative structural LSP constructs must be covered by tests | [[requirements/ofmarkdown-parity]] |
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
| `tests/integration/structural-lsp/structural-lsp.integration.spec.ts` | Integration | `Parity.StructuralLSP.Coverage` | 🔴 failing |
| `tests/bdd/steps/ofmarkdown-parity.steps.ts` | BDD | `Parity.StructuralLSP.Coverage` | 🔴 failing |

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

**Unblocks:**

- [[CHORE-054]] - test matrix sweep can verify final Phase 17 rows after this task

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
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

Run this after the three structural handlers exist. Keep tests representative rather than exhaustive parser duplication.

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
