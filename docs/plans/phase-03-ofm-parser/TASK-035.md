---
id: "TASK-035"
title: "Implement WikiLinkParser"
type: task
status: open
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-040"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-035"]
---

# Implement WikiLinkParser

> [!INFO] `TASK-035` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Create `src/parser/wiki-link-parser.ts` implementing the `WikiLinkParser` class. The parser uses a character-level FSM (not a regex applied to the whole document) to find `[[...]]` tokens that occur outside opaque regions. It handles all wiki-link variants: simple file links, display aliases, heading links, block references, path-qualified links, intra-document heading and block references, and empty links (which produce diagnostic `FG003`). Each found token is returned as a `WikiLinkEntry` with a fully populated `range` in LSP coordinates.

---

## Implementation Notes

- Accept the `OpaqueRegion[]` list and skip any `[[` that starts inside an opaque region
- Use a character-level FSM: states `OUTSIDE`, `OPEN_1` (seen first `[`), `INSIDE`, `CLOSE_1` (seen first `]`)
- Parse the captured content into `target`, `heading`, `blockId`, and `alias` fields
- Convert byte offsets to `Range` (line/character) using a line-offset map pre-computed from the document
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Wiki-link extraction from OFM documents | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Server indexes wiki-links in opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/wiki-link-parser.test.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR012-parser-safety-policy]] | No I/O in parser; no ReDoS; bounded input; FSM not regex |

---

## Parent Feature

[[tickets/FEAT-004]] — OFM Parser

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-030]] — `WikiLinkEntry` and `OpaqueRegion` types must be defined
- [[tickets/TASK-040]] — `OpaqueRegionMarker` must be available to provide opaque regions

**Unblocks:**

- [[tickets/TASK-041]] — `OFMParser` orchestrator calls `WikiLinkParser` in Stage 3

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

All eight variant forms listed in the plan must have dedicated test cases. The empty link case `[[]]` must emit `FG003` and still be included in the index with `target: ''`.

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
