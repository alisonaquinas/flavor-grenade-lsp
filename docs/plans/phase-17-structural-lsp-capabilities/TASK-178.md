---
id: "TASK-178"
title: "Implement selection ranges"
type: task
status: open
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-175"]
tags: [tickets/task, "phase/17"]
aliases: ["TASK-178"]
---

# Implement selection ranges

> [!INFO] `TASK-178` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `open`

## Description

Implement `textDocument/selectionRange` so selections expand from the cursor token to the enclosing OFM construct, paragraph, section, and document. The hierarchy must be stable and conservative, especially near opaque regions.

---

## Implementation Notes

- Build parent chains from parsed spans where available
- Expand from link target, tag, block anchor, heading text, callout marker, and frontmatter entry to broader constructs
- Keep every returned range within the current document bounds
- Do not expand across opaque region boundaries
- See also: [[design/api-layer]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.SelectionRanges` | Selection ranges expand through OFMarkdown construct boundaries | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.Coverage` | Selection ranges must reflect OFMarkdown structure | [[requirements/functional/ofmarkdown-parity]] |
| `ST-002` | Opaque regions are respected when deriving ranges | [[requirements/semantic-tokens]] |
| `Security.Input.PositionValidation` | Validate positions and ranges before structural queries | [[requirements/security/input-validation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Structural LSP selection ranges expand through OFM constructs |
| `docs/bdd/features/navigation.feature` | Go-to-definition on `[[doc#heading]]` navigates to the heading line |
| `docs/bdd/features/callouts.feature` | Callout with title text is detected and title is preserved |
| `docs/bdd/features/frontmatter.feature` | title key is extracted and available in document metadata |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/handlers/selection-range-handler.spec.ts` | Unit | `Parity.StructuralLSP.Coverage` | 🔴 failing |
| `tests/integration/selection-ranges/selection-ranges.integration.spec.ts` | Integration | `Security.Input.PositionValidation` | 🔴 failing |

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

- [[TASK-175]] - structural capabilities must be registered first

**Unblocks:**

- [[TASK-179]] - structural test suite covers selection ranges after implementation

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Selection range parent chains expand in the order token, construct, paragraph, section, document
- [ ] Selection ranges remain within current document bounds
- [ ] Selection ranges never cross fenced code, math, comment, or Templater opaque region boundaries
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-024]] child task row updated to `in-review`

---

## Notes

Noisy selection expansion is a risk. Prefer fewer, predictable ancestors over deeply nested or surprising chains.

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
