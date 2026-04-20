---
id: "TASK-034"
title: "Implement CodeParser"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-034"]
---

# Implement CodeParser

> [!INFO] `TASK-034` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/code-parser.ts` implementing the `CodeParser` class. The parser identifies three categories of code region: fenced code blocks (backtick triple `` ``` `` or tilde `~~~` delimiters), indented code blocks (four-space indent), and inline code spans (single backtick `` `...` ``). Each matched region is returned as an `OpaqueRegion` with `kind: 'code'`. All OFM syntax (wiki-links, tags, callouts) inside these regions must be suppressed.

---

## Implementation Notes

- Process fenced blocks first; the opening fence sets the closing fence character and count
- Indented code blocks: a line starting with four or more spaces that follows a blank line
- Inline code: single backtick pair; may not span lines
- Use character-level scan per line for indented code; FSM for fenced and inline
- Return `OpaqueRegion[]` with `kind: 'code'`, `start`, and `end` byte offsets
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code opaque region marking | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | Code parsing is tested indirectly via OpaqueRegionMarker and WikiLinkParser/TagParser scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/opaque-region-marker.test.ts` | Unit | — | 🔴 failing |

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

- [[TASK-030]] — `OpaqueRegion` type must be defined first

**Unblocks:**

- [[TASK-040]] — `OpaqueRegionMarker` composes `CommentParser`, `MathParser`, and `CodeParser`

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

A fenced code block opened with backticks must be closed with the same number of backticks; a different count does not close it. An unclosed fenced block at end of document marks the rest of the document as opaque.

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
