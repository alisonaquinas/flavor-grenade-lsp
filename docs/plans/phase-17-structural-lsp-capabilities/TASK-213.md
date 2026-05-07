---
id: "TASK-213"
title: "Add Templater opaque regions"
type: task
status: green
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-177"]
tags: [tickets/task, "phase/17"]
aliases: ["TASK-213"]
---

# Add Templater opaque regions

> [!INFO] `TASK-213` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `green`

## Description

Represent Obsidian Templater expressions as opaque parser regions so structural
LSP ranges never parse through or expand across `<% ... %>` spans.

---

## Implementation Notes

- Modify `src/parser/types.ts` so `OpaqueRegion.kind` includes `templater`.
- Modify `src/parser/opaque-region-marker.ts` to mark inline and block
  Templater spans before token parsing.
- Update folding and selection behavior to treat `templater` like other opaque
  regions.
- Add focused parser and structural handler tests before implementation.
- See also: [[ofm-spec/templater]] and [[requirements/semantic-tokens]].

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.FoldingRanges` | Folding ranges must not cross Templater regions | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.SelectionRanges` | Selection ranges must not cross Templater regions | [[requirements/functional/ofmarkdown-parity]] |
| `ST-002` | Opaque regions are respected when deriving ranges | [[requirements/semantic-tokens]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Structural LSP ranges do not cross Templater regions |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/opaque-region-marker.test.ts` | Unit | `ST-002` | 🟢 passing |
| `src/handlers/__tests__/folding-range.handler.test.ts` | Unit | `Parity.StructuralLSP.FoldingRanges` | 🟢 passing |
| `src/handlers/__tests__/selection-range.handler.test.ts` | Unit | `Parity.StructuralLSP.SelectionRanges` | 🟢 passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR012-parser-safety-policy]] | Opaque regions are marked before token parsers run |

---

## Parent Feature

[[FEAT-024]] - Structural LSP Capabilities

---

## Dependencies

**Blocked by:**

- [[TASK-177]] - folding range implementation established opaque range handling

**Unblocks:**

- [[TASK-179]] - full structural LSP coverage requires Templater evidence
- [[CHORE-053]] - lint sweep runs after parser and handler changes are complete

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Parser marks `<% ... %>` spans as `templater` opaque regions
- [ ] Folding ranges include bounded Templater opaque ranges
- [ ] Selection ranges inside Templater regions do not expand outside them
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files

---

## Notes

This ticket was added during Phase 17 Step A-C review because the phase scope
already required Templater opaque boundaries, but the parser only modeled code,
math, and comment opaque regions.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry.

> [!INFO] Opened - 2026-05-07
> Ticket created from Phase 17 Step A-C review. Status: `open`.

> [!WARNING] Red - 2026-05-07
> Added failing parser, folding-range, and selection-range tests for Templater
> opaque regions. Status: `red`; implementation is intentionally deferred to
> the GREEN stage.

> [!SUCCESS] Green - 2026-05-07
> Added `TemplaterParser`, registered Templater spans in `OpaqueRegionMarker`,
> and constrained selection ranges inside opaque Templater blocks. Focused
> parser, folding, and selection tests now pass. Status: `green`.
