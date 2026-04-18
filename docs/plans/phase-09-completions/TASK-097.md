---
id: "TASK-097"
title: "Implement completion.candidates cap with isIncomplete"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-092"]
tags: [tickets/task, "phase/9"]
aliases: ["TASK-097"]
---

# Implement completion.candidates cap with isIncomplete

> [!INFO] `TASK-097` · Task · Phase 9 · Parent: [[tickets/FEAT-010]] · Status: `open`

## Description

Implement the `completion.candidates` configuration cap inside `CompletionRouter`. After each sub-provider returns its item list, the router checks the count against the configured limit (default 50). If the item count exceeds the limit, the list is sliced to exactly `limit` items and `isIncomplete` is set to `true`, signalling to the LSP client that additional items exist. If the count is within the limit, `isIncomplete` is `false`.

---

## Implementation Notes

- Configuration key: `completion.candidates` (integer, default 50)
- Applied universally after every sub-provider returns, before returning from `CompletionRouter.complete()`
- Logic:

  ```typescript
  const limit = this.config.completion?.candidates ?? 50;
  const isIncomplete = items.length > limit;
  return { isIncomplete, items: isIncomplete ? items.slice(0, limit) : items };
  ```

- Linked req: [[requirements/completions]] `Completion.CandidateCap`
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Completion.CandidateCap — cap and isIncomplete signalling | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/completions]] | `Completion list is capped at configured limit` |
| [[bdd/features/completions]] | `isIncomplete is true when list exceeds limit` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/completion-router.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[tickets/FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-092]] — cap logic lives inside `CompletionRouter`

**Unblocks:**

- None within Phase 9

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
- [ ] Parent feature [[tickets/FEAT-010]] child task row updated to `in-review`

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-010]].

> [!SUCCESS] Done — 2026-04-17
> Implementation complete and tested. All acceptance criteria met. Lint clean, tsc clean, 321 tests pass. Status: `done`.
