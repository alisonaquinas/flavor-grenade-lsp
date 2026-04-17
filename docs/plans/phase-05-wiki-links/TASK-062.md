---
id: "TASK-062"
title: "Implement ReferencesService for headings"
type: task
status: open
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-057"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-062"]
---

# Implement ReferencesService for headings

> [!INFO] `TASK-062` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Create `src/handlers/references.handler.ts`. This handler responds to `textDocument/references` LSP requests. It identifies the entity at the cursor position (heading, tag, block anchor, or document), constructs the appropriate `DefKey`, queries the `RefGraph` for all `Ref`s that resolve to that key, and maps each `Ref` to an LSP `Location`. When `includeDeclaration` is true, the definition location is prepended to the results.

---

## Implementation Notes

- Handle `textDocument/references` LSP method
- Step 1: determine entity at cursor — heading, block anchor, or document-level
- Step 2: construct `DefKey` for that entity
- Step 3: call `refGraph.refsFor(defKey)` to get all referencing `Ref`s
- Step 4: map each `Ref.entry` range and `Ref.sourceDocId` to an LSP `Location`
- Step 5: if `includeDeclaration` is true, prepend `Location` of the definition itself
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Find-references requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Find-references returns all wiki-links targeting a heading` |
| [[bdd/features/wiki-links]] | `Find-references includes declaration when requested` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/handlers/references-handler.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | DefKey construction and RefGraph query semantics |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-057]] — RefGraph must be implemented before ReferencesService can query it

**Unblocks:**

- [[tickets/TASK-065]] — LspModule registers ReferencesService capability

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
- [ ] Parent feature [[tickets/FEAT-006]] child task row updated to `in-review`

---

## Notes

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-006]].
