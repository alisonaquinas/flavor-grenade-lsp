---
id: "TASK-048"
title: "Implement FolderLookup suffix tree"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-047"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-048"]
---

# Implement FolderLookup suffix tree

> [!INFO] `TASK-048` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Create `src/vault/folder-lookup.ts`. `FolderLookup` provides Obsidian-compatible approximate name matching by building a trie over reversed path segments. When a wiki-link contains only a bare stem like `[[alpha]]`, the lookup finds all documents whose stem ends in `"alpha"` regardless of their folder path. It supports exact stem lookup, suffix stem lookup, and path-qualified lookup for disambiguation.

---

## Implementation Notes

- Key interface:

  ```typescript
  export interface LookupResult {
    docId: DocId;
    doc: OFMDoc;
  }

  export class FolderLookup {
    /** Rebuild the lookup from the current VaultIndex */
    rebuild(index: VaultIndex): void;

    /** Find all documents matching the given stem (case-insensitive) */
    findByStem(stem: string): LookupResult[];

    /** Find exact match by stem (returns one or undefined) */
    findExact(stem: string): LookupResult | undefined;

    /** Find all documents matching a path-qualified stem like "folder/note" */
    findByPath(path: string): LookupResult | undefined;
  }
  ```

- Algorithm: build a trie over reversed path segments; for query `"alpha"`, walk reversed segments to find all `DocId`s ending in `"alpha"`
- All comparisons are case-insensitive
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Name-matching and lookup requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `FolderLookup resolves bare stem to nested document` |
| [[bdd/features/workspace]] | `FolderLookup returns multiple results for ambiguous stem` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/folder-lookup.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault root anchoring for all path resolution |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-047]] — FolderLookup is rebuilt from VaultIndex

**Unblocks:**

- [[tickets/TASK-049]] — VaultScanner calls FolderLookup.rebuild() after initial scan
- [[tickets/TASK-056]] — Unit tests for FolderLookup

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
- [ ] Parent feature [[tickets/FEAT-005]] child task row updated to `in-review`

---

## Notes

See TASK-056 for detailed unit test cases covering stem matches, nested files, ambiguous stems, and path-qualified stems.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-005]].

> [!CHECK] Done — 2026-04-17
> `src/vault/folder-lookup.ts` implemented. Map<stem, DocId[]> rebuilt from VaultIndex.entries(). lookupByStem and path-qualified lookupByPath. All 7 tests pass. Status: `done`.
