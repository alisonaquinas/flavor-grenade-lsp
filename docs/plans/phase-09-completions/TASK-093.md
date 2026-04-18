---
id: "TASK-093"
title: "Implement ContextAnalyzer"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-092"]
tags: [tickets/task, "phase/9"]
aliases: ["TASK-093"]
---

# Implement ContextAnalyzer

> [!INFO] `TASK-093` · Task · Phase 9 · Parent: [[FEAT-010]] · Status: `open`

## Description

Create `src/completion/context-analyzer.ts`. The `ContextAnalyzer` scans backwards from the cursor position to identify the active completion trigger sequence and returns a typed context object that `CompletionRouter` switches on. It must correctly handle all six trigger patterns: `[[` (wiki-link), `[[doc#` (heading), `[[doc#^` (block ref), `![[` (embed), `#` at word start (tag), and `> [!` (callout). Anything else returns `kind: 'none'`.

---

## Implementation Notes

- Scan backwards from cursor to find trigger sequence
- Trigger patterns and extracted context fields:
  - `[[` with no subsequent `#` → `{ kind: 'wiki-link' }`
  - `[[<stem>#` with no `^` → `{ kind: 'wiki-link-heading', targetStem, headingPrefix }`
  - `[[<stem>#^` → `{ kind: 'wiki-link-block', targetStem, anchorPrefix }`
  - `![[` → `{ kind: 'embed' }`
  - `#` preceded by whitespace or at line start → `{ kind: 'tag' }`
  - `> [!` → `{ kind: 'callout' }`
  - Otherwise → `{ kind: 'none' }`
- Edge cases to handle: cursor at line start, cursor inside a code block (treat as opaque — no completion), cursor inside a frontmatter block
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Completion context discrimination from cursor position | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `ContextAnalyzer returns correct kind for each trigger` |
| `bdd/features/completions.feature` | `ContextAnalyzer returns none inside code block` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/context-analyzer.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- [[TASK-092]] — `CompletionRouter` structure must exist before `ContextAnalyzer` can be wired into it

**Unblocks:**

- [[TASK-094]] — heading provider receives context from `ContextAnalyzer`
- [[TASK-095]] — callout provider receives context from `ContextAnalyzer`
- [[TASK-096]] — embed provider receives context from `ContextAnalyzer`

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
- [ ] Parent feature [[FEAT-010]] child task row updated to `in-review`

---

## Notes

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
> Ticket created. Status: `open`. Parent: [[FEAT-010]].

> [!SUCCESS] Done — 2026-04-17
> Implementation complete and tested. All acceptance criteria met. Lint clean, tsc clean, 321 tests pass. Status: `done`.
