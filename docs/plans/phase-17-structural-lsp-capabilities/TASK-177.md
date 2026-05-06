---
id: "TASK-177"
title: "Implement folding ranges"
type: task
status: green
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-175"]
tags: [tickets/task, "phase/17"]
aliases: ["TASK-177"]
---

# Implement folding ranges

> [!INFO] `TASK-177` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `green`

## Description

Implement `textDocument/foldingRange` for OFMarkdown structural regions. Returned ranges must cover frontmatter, headings, callouts, fenced code, math blocks, Obsidian comments, and Templater regions without crossing opaque-region boundaries.

---

## Implementation Notes

- Derive ranges from parsed OFM structure, not ad hoc line scanning where parser spans exist
- Include heading section ranges that end before the next same-or-higher heading
- Include opaque-region fold ranges while preventing other ranges from crossing them
- Validate document URI and range bounds before returning results
- See also: [[design/api-layer]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.FoldingRanges` | Folding ranges expose supported OFMarkdown structures without crossing opaque regions | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.Coverage` | Folding ranges must reflect OFMarkdown structure | [[requirements/functional/ofmarkdown-parity]] |
| `ST-002` | Opaque regions are excluded from token-derived structural ranges | [[requirements/semantic-tokens]] |
| `Security.Input.PositionValidation` | Validate positions and ranges before structural queries | [[requirements/security/input-validation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/frontmatter.feature` | Frontmatter must start on line 1 with `---` delimiter |
| `docs/bdd/features/callouts.feature` | Foldable callout with dash suffix is detected |
| `docs/bdd/features/callouts.feature` | Nested callout at depth 2 is detected |
| `docs/bdd/features/ofmarkdown-parity.feature` | Structural LSP fold ranges cover representative OFM constructs |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/handlers/__tests__/folding-range.handler.test.ts` | Unit | `Parity.StructuralLSP.FoldingRanges` | ✅ passing |

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

- [[TASK-179]] - structural test suite covers folding ranges after implementation

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] Folding ranges cover parser-backed Phase 17 in-scope constructs
- [x] Folding ranges never cross fenced code, math, or comment opaque region boundaries
- [x] `bun run lint --max-warnings 0` passes
- [x] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-024]] child task row updated to `in-review`

---

## Notes

Start conservative for heading and callout folds. Prefer correct bounded ranges over aggressive editor-style folding.

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

> [!FAILURE] Red - 2026-05-06
> Added failing unit coverage for frontmatter folds, heading section folds,
> callout block folds, and parser-backed opaque code, math, and comment folds.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> `FoldingRangeHandler` now emits bounded folds for frontmatter, heading
> sections, callout blocks, and parser-backed opaque code, math, and comment
> regions. Focused handler coverage, `bun run typecheck`, and
> `bun run lint -- --max-warnings 0` pass. Status: `green`.
