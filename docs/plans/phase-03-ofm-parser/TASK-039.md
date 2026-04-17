---
id: "TASK-039"
title: "Implement CalloutParser"
type: task
status: open
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-040"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-039"]
---

# Implement CalloutParser

> [!INFO] `TASK-039` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Create `src/parser/callout-parser.ts` implementing the `CalloutParser` class. The parser detects Obsidian callout blocks by scanning for `> [!TYPE]` patterns at the start of blockquote lines. Each callout entry records the nesting depth (number of `>` characters), the callout type (e.g., `NOTE`, `WARNING`), the fold indicator (`-` collapsed, `+` expanded, or absent for non-foldable), and the optional title text. Each matched callout is returned as a `CalloutEntry` in the `OFMIndex`.

---

## Implementation Notes

- Pattern per line: `/^(>+)\s*\[!([A-Z-]+)\]([+-]?)(\s+.*)?$/`
- Group 1: nesting depth (count `>` characters)
- Group 2: callout type (uppercase)
- Group 3: fold indicator
- Group 4: optional title text (trim leading whitespace)
- Process line by line; skip lines inside opaque regions
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Callout extraction from OFM documents | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/callouts]] | `Server indexes callouts in opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/callout-parser.test.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-030]] — `CalloutEntry` and `OpaqueRegion` types must be defined
- [[tickets/TASK-040]] — `OpaqueRegionMarker` must be available

**Unblocks:**

- [[tickets/TASK-041]] — `OFMParser` orchestrator calls `CalloutParser` in Stage 3

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

Test cases: simple `> [!NOTE]`, nested `>> [!WARNING]`, callout with title `> [!INFO] My Title`, collapsible `> [!TIP]-`, expanded `> [!TIP]+`, and a `> [!note]` (lowercase — should NOT match since the pattern requires uppercase).

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
