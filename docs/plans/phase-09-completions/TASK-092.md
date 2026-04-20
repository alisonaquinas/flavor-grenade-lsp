---
id: "TASK-092"
title: "Implement unified CompletionRouter"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/9"]
aliases: ["TASK-092"]
---

# Implement unified CompletionRouter

> [!INFO] `TASK-092` · Task · Phase 9 · Parent: [[FEAT-010]] · Status: `open`

## Description

Create `src/completion/completion-router.ts`. This is the single entry point for all `textDocument/completion` requests. It delegates to `ContextAnalyzer` to determine the completion kind from cursor position, then dispatches to the appropriate sub-provider via a `switch` on `context.kind`. It also applies the `completion.candidates` cap and injects the current `linkStyle` configuration into each sub-provider. Returns an empty `CompletionList` for unrecognized contexts.

---

## Implementation Notes

- Class: `CompletionRouter`
- Method signature: `async complete(params: CompletionParams, doc: OFMDoc): Promise<CompletionList>`
- Routing switch:

  ```typescript
  switch (context.kind) {
    case 'wiki-link':         return this.wikiLinkProvider.complete(context);
    case 'wiki-link-heading': return this.headingProvider.complete(context);
    case 'wiki-link-block':   return this.blockRefProvider.complete(context);
    case 'embed':             return this.embedProvider.complete(context);
    case 'tag':               return this.tagProvider.complete(context);
    case 'callout':           return this.calloutProvider.complete(context);
    default:                  return { isIncomplete: false, items: [] };
  }
  ```

- `linkStyle` from config is injected into each sub-provider on construction
- ADR: [[adr/ADR005-wiki-style-binding]]
- Linked BDD: `bdd/features/completions.feature`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Unified completion routing | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `CompletionRouter dispatches to correct sub-provider` |

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

[[FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-093]] — `ContextAnalyzer` is called from within `CompletionRouter`
- [[TASK-097]] — candidates cap is applied inside `CompletionRouter`
- [[TASK-100]] — intra-doc block ref completion is routed through `CompletionRouter`
- [[TASK-101]] — capability registration follows `CompletionRouter` completion

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
