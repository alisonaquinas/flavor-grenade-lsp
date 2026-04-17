---
id: "TASK-033"
title: "Implement MathParser"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-033"]
---

# Implement MathParser

> [!INFO] `TASK-033` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Create `src/parser/math-parser.ts` implementing the `MathParser` class. The parser identifies two categories of math region: display math blocks delimited by `$$\n...\n$$` (block-level, may span multiple lines) and inline math spans delimited by `$...$` (must not span newlines). Each matched region is returned as an `OpaqueRegion` with `kind: 'math'`. Wiki-link and tag parsers must not match tokens inside these regions.

---

## Implementation Notes

- Process display math (`$$`) before inline math (`$`) to avoid ambiguity
- Inline `$...$` must not contain a newline character — a `\n` inside terminates the match attempt
- Use a character-level scan to avoid ReDoS; do not use a global regex over the full document
- Return `OpaqueRegion[]` with `kind: 'math'`, `start`, and `end` byte offsets
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Math opaque region marking | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | Math parsing is tested indirectly via OpaqueRegionMarker and WikiLinkParser/TagParser scenarios |

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

[[tickets/FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-030]] — `OpaqueRegion` type must be defined first

**Unblocks:**

- [[tickets/TASK-040]] — `OpaqueRegionMarker` composes `CommentParser`, `MathParser`, and `CodeParser`

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
- [ ] Parent feature [[tickets/FEAT-004]] child task row updated to `in-review`

---

## Notes

A `$` that is not followed by a matching closing `$` on the same line must not be treated as an opaque region — it is a literal dollar sign.

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
