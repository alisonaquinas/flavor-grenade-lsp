---
id: "TASK-037"
title: "Implement BlockAnchorParser"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-040"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-037"]
---

# Implement BlockAnchorParser

> [!INFO] `TASK-037` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/block-anchor-parser.ts` implementing the `BlockAnchorParser` class. The parser detects block anchor identifiers of the form `^anchor-id` that appear at the end of a non-blank line (after any trailing whitespace). The `^` character must not be inside an opaque region, and the anchor ID must match `/^[a-zA-Z0-9-]+$/`. A `^` that appears in the middle of a line (for example in a math expression `x^2`) must not be matched.

---

## Implementation Notes

- Process the document line by line; for each non-blank line check whether it ends with `\s*\^[a-zA-Z0-9-]+`
- Verify that the `^` byte offset is not inside any opaque region before recording it
- Return `BlockAnchorEntry[]` with the anchor ID, the line number, and the LSP `Range` of the anchor token
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Block anchor extraction from OFM documents | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | Block anchor parsing is tested indirectly via wiki-link block reference scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/block-anchor-parser.test.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No I/O in parser; no ReDoS; bounded input |

---

## Parent Feature

[[FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- [[TASK-030]] — `BlockAnchorEntry` and `OpaqueRegion` types must be defined
- [[TASK-040]] — `OpaqueRegionMarker` must be available

**Unblocks:**

- [[TASK-041]] — `OFMParser` orchestrator calls `BlockAnchorParser` in Stage 3

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
- [ ] Parent feature [[FEAT-004]] child task row updated to `in-review`

---

## Notes

Test cases: valid anchor at line end, `^` mid-line (not matched), `^` inside code block (not matched), `^` with invalid ID characters (not matched), anchor with trailing spaces before end of line (matched).

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
> Ticket created. Status: `open`. Parent: [[FEAT-004]].

> [!SUCCESS] Done — 2026-04-17
> Implemented and tested. All acceptance criteria met. Status: `done`.
