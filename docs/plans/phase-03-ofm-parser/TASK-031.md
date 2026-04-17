---
id: "TASK-031"
title: "Implement FrontmatterParser"
type: task
status: open
priority: high
phase: 3
parent: "FEAT-004"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030"]
tags: [tickets/task, "phase/3"]
aliases: ["TASK-031"]
---

# Implement FrontmatterParser

> [!INFO] `TASK-031` · Task · Phase 3 · Parent: [[tickets/FEAT-004]] · Status: `open`

## Description

Create `src/parser/frontmatter-parser.ts` implementing the `FrontmatterParser` class. The parser detects whether a document begins with a YAML frontmatter block (opening `---` at byte offset 0, followed by a closing `---` delimiter), extracts and parses the YAML between the delimiters using `js-yaml`, and returns both the parsed frontmatter object and the byte offset at which the document body begins. If YAML parsing throws, the parser emits diagnostic `FG007` and returns `{ frontmatter: null, bodyOffset: 0 }`.

---

## Implementation Notes

- Detect `---\n` at byte offset 0; if absent, return `{ frontmatter: null, bodyOffset: 0 }` immediately
- Find the closing `---\n` delimiter by scanning forward; handle documents with no closing delimiter gracefully
- Parse YAML using `js-yaml`; catch exceptions and emit `FG007`
- Dependencies: `bun add js-yaml && bun add --dev @types/js-yaml`
- See also: [[adr/ADR012-parser-safety-policy]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Frontmatter extraction from OFM documents | [[plans/phase-03-ofm-parser]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/frontmatter]] | `Server parses frontmatter from opened document` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/parser/__tests__/frontmatter-parser.test.ts` | Unit | — | 🔴 failing |

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

- [[tickets/TASK-030]] — `OFMDoc` types must be defined first

**Unblocks:**

- [[tickets/TASK-041]] — `OFMParser` orchestrator calls `FrontmatterParser` as its first stage

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

Test cases must include: document with valid frontmatter, document without frontmatter, document with malformed YAML (FG007 emitted), and document with no closing `---` delimiter.

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
