---
id: "TASK-069"
title: "Implement tag CompletionProvider"
type: task
status: done
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-068"]
tags: [tickets/task, "phase/6"]
aliases: ["TASK-069"]
---

# Implement tag CompletionProvider

> [!INFO] `TASK-069` · Task · Phase 6 · Parent: [[FEAT-007]] · Status: `open`

## Description

Create `src/completion/tag-completion-provider.ts`. The provider is triggered by the `#` character and queries `TagRegistry.allTags()` to produce a frequency-sorted list of `CompletionItem` objects. The leading `#` is stripped from each tag string (the client supplies `#` as the trigger character). Results are capped by the configured `completion.candidates` limit. Items use `CompletionItemKind.Value` (kind 12).

---

## Implementation Notes

- Trigger character: `#`
- Query `TagRegistry.allTags()` — already frequency-sorted
- Strip leading `#` from each tag string for the `CompletionItem.label`
- Set `kind: CompletionItemKind.Value` (= 12) on each item
- Apply `completion.candidates` cap to limit result count
- Register `#` as a trigger character in the server's `completionProvider` capabilities
- See also: design/completion-system

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Tag completion triggered by `#` | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `Tag completion returns known tags` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-vault-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Tag completion is scoped to OFM syntax only |

---

## Parent Feature

[[FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- [[TASK-068]] — tag index must be populated before completion can query it

**Unblocks:**

- None within Phase 6

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
- [ ] Parent feature [[FEAT-007]] child task row updated to `in-review`

---

## Notes

The candidates cap prevents extremely large vaults from flooding the completion list. Frequency sort ensures the most useful tags appear first.

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
> Ticket created. Status: `open`. Parent: [[FEAT-007]].

> [!SUCCESS] Done — 2026-04-17
> Implemented in GREEN commit 2af7882. All 225 tests pass; lint and tsc clean. Status: `done`.
