---
id: "TASK-036"
title: "Implement EmbedParser"
type: task
status: done
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-040"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-036"]
---

# Implement EmbedParser

> [!INFO] `TASK-036` · Task · Phase 3 · Parent: [[FEAT-004]] · Status: `open`

## Description

Create `src/parser/embed-parser.ts` implementing the `EmbedParser` class. Embeds use the same `[[...]]` syntax as wiki-links but are prefixed by `!`. The `!` prefix must itself be outside any opaque region. The parser shares the FSM logic with `WikiLinkParser` but additionally handles embed-width syntax: when the target has an image extension, `|200` or `|200x150` is a size specifier rather than a display alias. Each embed token is returned as an `EmbedEntry` in the `OFMIndex`.

---

## Implementation Notes

- Reuse or share the character-level FSM from `WikiLinkParser`; the only addition is the leading `!` check
- Check that the `!` at `offset - 1` is not inside an opaque region
- Distinguish size specifiers from aliases: if the target extension is an image type (`.png`, `.jpg`, `.gif`, `.svg`, `.webp`) and the pipe suffix matches `/^\d+(x\d+)?$/`, treat it as a size specifier
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Embed extraction from OFM documents | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/wiki-links.feature` | `Server indexes embeds in opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/embed-parser.test.ts` | Unit | — | 🔴 failing |

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

- [[TASK-030]] — `EmbedEntry` and `OpaqueRegion` types must be defined
- [[TASK-040]] — `OpaqueRegionMarker` must be available

**Unblocks:**

- [[TASK-041]] — `OFMParser` orchestrator calls `EmbedParser` in Stage 3

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

A `![[note]]` where `!` is inside a code block must not be matched. Test this case explicitly.

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
