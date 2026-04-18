---
id: "TASK-058"
title: "Implement Oracle name-matching engine"
type: task
status: done
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-064"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-058"]
---

# Implement Oracle name-matching engine

> [!INFO] `TASK-058` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Create `src/resolution/oracle.ts`. The `Oracle` wraps `FolderLookup` and implements the three link-style resolution modes (`file-stem`, `title-slug`, `file-path-stem`). It applies the Obsidian-compatible resolution order: exact path match first, then alias match from frontmatter, then stem suffix match (longest-suffix wins if unique), yielding ambiguous (FG002) when multiple matches exist and broken (FG001) when zero matches exist. It also resolves heading and block anchor targets within a known document.

---

## Implementation Notes

- Key interface:

  ```typescript
  export type LinkStyle = 'file-stem' | 'title-slug' | 'file-path-stem';

  export class Oracle {
    resolve(target: string, style: LinkStyle): LookupResult[];
    resolveWithAlias(target: string): LookupResult[];
    resolveHeading(docId: DocId, heading: string): HeadingEntry | undefined;
    resolveBlockId(docId: DocId, blockId: string): BlockAnchorEntry | undefined;
  }
  ```

- Resolution order: (1) exact path match; (2) alias match from `frontmatter.aliases`; (3) stem match (longest-suffix wins if unique); (4) multiple matches → ambiguous FG002; (5) zero matches → broken FG001
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Link resolution order requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Oracle resolves exact path match` |
| [[bdd/features/wiki-links]] | `Oracle resolves via alias` |
| [[bdd/features/wiki-links]] | `Oracle resolves bare stem to unique document` |
| [[bdd/features/wiki-links]] | `Oracle reports ambiguous when multiple stems match` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/resolution/oracle.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Link style resolution modes and Obsidian-compatible ordering |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-064]] — alias resolution must be implemented before Oracle.resolveWithAlias() can be correct

**Unblocks:**

- [[tickets/TASK-059]] — LinkResolver uses Oracle to resolve wiki-link entries

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
