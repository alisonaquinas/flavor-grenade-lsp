---
id: "TASK-032"
title: "Implement CommentParser"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-032"]
---

# Implement CommentParser

> [!INFO] `TASK-032` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/comment-parser.ts` implementing the `CommentParser` class. The parser scans the document body for Obsidian comment spans (`%%...%%`) and returns a list of `OpaqueRegion` objects with `kind: 'comment'` covering every matched span. OFM syntax found inside comment regions must be invisible to all subsequent parsers; the `OpaqueRegionMarker` will use this list to suppress other parsers within these byte ranges.

---

## Implementation Notes

- Use a character-level scan (not a whole-document regex) to locate `%%` open and close pairs
- Nested `%%` pairs are not valid in Obsidian; treat the first `%%` after an open as the close
- Return `OpaqueRegion[]` with `kind: 'comment'`, `start`, and `end` byte offsets
- No I/O; pure function over string input
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Comment opaque region marking | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | Comment parsing is tested indirectly via OpaqueRegionMarker and WikiLinkParser scenarios |

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

Edge cases: unclosed `%%` at end of document (treat rest of document as opaque), adjacent `%%%%` (two empty comments or one empty comment), and `%%` inside a code block (handled by `OpaqueRegionMarker` ordering, not by `CommentParser` itself).

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
