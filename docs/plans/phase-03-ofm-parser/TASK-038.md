---
id: "TASK-038"
title: "Implement TagParser"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-040"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-038"]
---

# Implement TagParser

> [!INFO] `TASK-038` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/tag-parser.ts` implementing the `TagParser` class. The parser finds Obsidian inline tags using a Unicode-aware pattern: `#[\p{L}\p{N}_/-]+` with the `u` flag. A match is only valid when the `#` is not inside an opaque region, is preceded by whitespace, start of line, or certain punctuation (not an alphanumeric character), and the slash in nested tags like `#project/active` is treated as part of the tag identifier rather than a path separator.

---

## Implementation Notes

- Use `new RegExp('#[\\p{L}\\p{N}_/-]+', 'gu')` for matching (Unicode property escapes, global, unicode mode)
- Before recording a match, verify the `#` offset is not inside an opaque region
- Verify the character immediately preceding `#` is not alphanumeric (to avoid matching hex colors or other non-tag uses)
- Return `TagEntry[]` with the tag name (including leading `#`) and its LSP `Range`
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Tag extraction from OFM documents | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/tags.feature` | `Server indexes tags in opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/tag-parser.test.ts` | Unit | — | 🔴 failing |

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

- [[TASK-030]] — `TagEntry` and `OpaqueRegion` types must be defined
- [[TASK-040]] — `OpaqueRegionMarker` must be available

**Unblocks:**

- [[TASK-041]] — `OFMParser` orchestrator calls `TagParser` in Stage 3

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

Test with Unicode tag names (e.g., `#概念`), nested tags (`#project/active`), and tags inside code blocks (must not match). Also test that `#000000` (hex color) is not incorrectly matched when preceded by alphanumeric characters.

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
