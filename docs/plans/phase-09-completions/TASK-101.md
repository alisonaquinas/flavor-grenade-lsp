---
id: "TASK-101"
title: "Register updated completion capabilities"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-092"]
tags: [tickets/task, "phase/9"]
aliases: ["TASK-101"]
---

# Register updated completion capabilities

> [!INFO] `TASK-101` · Task · Phase 9 · Parent: [[FEAT-010]] · Status: `open`

## Description

Update `InitializeResult.capabilities.completionProvider` to reflect the full set of trigger characters and commit characters now handled by the Phase 9 `CompletionRouter`. This ensures LSP clients request completion at all appropriate trigger points. The updated capability object must declare trigger characters for `[`, `!`, `#`, and `>`, commit character `]`, and `resolveProvider: false`.

---

## Implementation Notes

- Update the `initialize` handler's returned capability object:

  ```typescript
  completionProvider: {
    triggerCharacters: ['[', '!', '#', '>'],
    allCommitCharacters: [']'],
    resolveProvider: false,
  }
  ```

- Verify that the `CompletionRouter` is wired as the handler for `textDocument/completion` in the dispatch table
- No new logic; this is a capability declaration update only
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | completionProvider capability registration | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `Server advertises completion trigger characters in InitializeResult` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/server/initialize.spec.ts` | Unit | — | 🔴 failing |

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

- [[TASK-092]] — `CompletionRouter` must be fully implemented before it can be registered as the handler

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
