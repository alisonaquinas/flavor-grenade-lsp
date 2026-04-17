---
id: "TASK-102"
title: "Consolidate DefinitionService"
type: task
status: open
priority: "high"
phase: "10"
parent: "FEAT-011"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-105"]
tags: [tickets/task, "phase/10"]
aliases: ["TASK-102"]
---

# Consolidate DefinitionService

> [!INFO] `TASK-102` · Task · Phase 10 · Parent: [[tickets/FEAT-011]] · Status: `open`

## Description

Ensure `textDocument/definition` handles all cursor positions exhaustively: `[[target]]` → navigate to `notes/target.md` (line 0); `[[target#heading]]` → navigate to heading line in `notes/target.md`; `[[target#^blockid]]` → navigate to block anchor line; `[[#heading]]` → navigate to heading in current document; `[[#^blockid]]` → navigate to block anchor in current document; `![[embed]]` → navigate to target file (markdown or asset); `#tag` → navigate to first occurrence of that tag in the vault; cursor on plain text → return `null`. The service must binary-search the `OFMIndex` ranges via the `entityAtPosition` utility to determine what entity is at the cursor position.

---

## Implementation Notes

- Use `entityAtPosition` (TASK-105) — that utility must exist before this task begins
- Binary-search OFMIndex ranges for efficient cursor resolution
- Return `null` (not an error) when cursor is on plain text
- ADR constraint: [[adr/ADR005-wiki-style-binding]] governs how link targets are resolved to file paths
- See also: [[design/navigation]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/navigation]] | `Go to definition for plain wiki-link` |
| [[bdd/features/navigation]] | `Go to definition for heading-fragment link` |
| [[bdd/features/navigation]] | `Go to definition for block-id fragment link` |
| [[bdd/features/navigation]] | `Go to definition for same-document heading ref` |
| [[bdd/features/navigation]] | `Go to definition for embed` |
| [[bdd/features/navigation]] | `Go to definition for tag` |
| [[bdd/features/navigation]] | `Go to definition returns null for plain text` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/navigation.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link style binding rules govern how cursor entities are resolved to file paths |

---

## Parent Feature

[[tickets/FEAT-011]] — Navigation

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-105]] — entityAtPosition utility must exist before DefinitionService can use it

**Unblocks:**

- [[tickets/TASK-106]] — multi-location definition results extend DefinitionService
- [[tickets/TASK-108]] — integration tests depend on DefinitionService being complete

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
- [ ] Parent feature [[tickets/FEAT-011]] child task row updated to `in-review`

---

## Notes

All cursor position cases must be covered. The `null` return for plain text is intentional and must not be an error response.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-011]].
