---
id: "TASK-112"
title: "Handle link style variants in rename edits"
type: task
status: done
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-110", "TASK-111"]
tags: [tickets/task, "phase/11"]
aliases: ["TASK-112"]
---

# Handle link style variants in rename edits

> [!INFO] `TASK-112` · Task · Phase 11 · Parent: [[tickets/FEAT-012]] · Status: `open`

## Description

Ensure rename edits preserve each link's existing style. Two styles are supported: `file-stem` (e.g. `[[note]]`) and `file-path-stem` (e.g. `[[folder/note]]`). During rename, if the existing link uses `file-stem` style, the edit updates using the stem only; if it uses `file-path-stem` style, the edit updates the full path including the path prefix. The server must not convert between link styles during rename — a `file-stem` link must remain `file-stem` after rename, and a `file-path-stem` link must remain `file-path-stem`.

---

## Implementation Notes

- Extends both heading rename (TASK-110) and file rename (TASK-111)
- Inspect each `Ref` in `RefGraph.refsFor(defKey)` to determine its existing link style
- ADR constraint: [[adr/ADR005-wiki-style-binding]] defines the two styles and their resolution rules
- The rename engine reads the existing link text to detect style — do not infer from the vault structure alone
- See also: [[bdd/features/rename]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Rename requirements | [[requirements/rename]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/rename]] | `Rename preserves file-stem link style` |
| [[bdd/features/rename]] | `Rename preserves file-path-stem link style` |
| [[bdd/features/rename]] | `Rename does not convert between link styles` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Defines the two link styles and the invariant that rename must not convert between them |

---

## Parent Feature

[[tickets/FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-110]] — heading rename must exist before style variant handling can be layered on
- [[tickets/TASK-111]] — file rename must exist before style variant handling can be layered on

**Unblocks:**

- [[tickets/TASK-117]] — integration tests cover link style variant scenarios

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
- [ ] Parent feature [[tickets/FEAT-012]] child task row updated to `in-review`

---

## Notes

Style detection must be based on the actual text of each existing link, not on inferred vault structure. Two links to the same file may have different styles and must be updated independently.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-012]].
