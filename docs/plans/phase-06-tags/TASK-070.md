---
id: "TASK-070"
title: "Implement find-references for tags"
type: task
status: done
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/6"]
aliases: ["TASK-070"]
---

# Implement find-references for tags

> [!INFO] `TASK-070` · Task · Phase 6 · Parent: [[tickets/FEAT-007]] · Status: `open`

## Description

Update `ReferencesService` (introduced in Phase 5) to handle the case where the cursor is positioned on a `#tag` token. The service identifies the tag string at the cursor position via `OFMIndex`, calls `TagRegistry.occurrences(tag)` to retrieve all vault-wide occurrences, maps each `TagOccurrence` to an LSP `Location`, and returns the full list. Parent-tag occurrences are NOT included unless explicitly requested.

---

## Implementation Notes

- In `ReferencesService.findReferences()`, detect when cursor position falls within a `#tag` span
- Extract the tag string from the `OFMIndex` at cursor
- Call `tagRegistry.occurrences(tag)` to get all `TagOccurrence[]`
- Map each occurrence to `Location { uri: docIdToUri(o.docId), range: o.range }`
- Do NOT include occurrences of parent tags (e.g., for `#project/active`, do not include `#project` hits)
- See also: [[design/references-service]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Find all vault occurrences of a given tag | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/tags]] | `Find references returns all tag occurrences` |

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
| [[adr/ADR002-ofm-only-scope]] | Tag find-references is scoped to OFM syntax only |

---

## Parent Feature

[[tickets/FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- None

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
- [ ] Parent feature [[tickets/FEAT-007]] child task row updated to `in-review`

---

## Notes

Cursor position detection for tags requires knowing the span of the `#tag` token from the OFM index. Ensure the span includes the leading `#`.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-007]].

> [!SUCCESS] Done — 2026-04-17
> Implemented in GREEN commit 2af7882. All 225 tests pass; lint and tsc clean. Status: `done`.
