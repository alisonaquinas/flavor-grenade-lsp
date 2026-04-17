---
id: "TASK-057"
title: "Implement RefGraph"
type: task
status: open
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/5"]
aliases: ["TASK-057"]
---

# Implement RefGraph

> [!INFO] `TASK-057` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Create `src/resolution/ref-graph.ts`. The `RefGraph` maintains a bidirectional mapping between link definitions (identified by `DefKey`) and the wiki-link entries that reference them. It is rebuilt from the full `VaultIndex` on each scan or file-change event. It provides query methods for all refs resolving to a given definition key (used by find-references), all unresolved refs (used to emit FG001 diagnostics), and all ambiguous refs (used to emit FG002 diagnostics).

---

## Implementation Notes

- Key interface:

  ```typescript
  export type DefKey = string;   // "<docId>#heading" or "<docId>#^blockId" or "<docId>"

  export interface Ref {
    sourceDocId: DocId;
    entry: WikiLinkEntry;         // from OFMIndex
    resolvedTo: DefKey | null;    // null = unresolved
    diagnostic?: DiagnosticCode;  // FG001 | FG002 | FG003
    candidates?: DocId[];         // for FG002 ambiguous
  }

  export class RefGraph {
    /** Rebuild from current VaultIndex — O(n * links) */
    rebuild(vaultIndex: VaultIndex, folderLookup: FolderLookup): void;

    /** All refs that resolve to defKey */
    refsFor(defKey: DefKey): Ref[];

    /** All unresolved refs (for diagnostic emission) */
    unresolvedRefs(): Ref[];

    /** All ambiguous refs */
    ambiguousRefs(): Ref[];
  }
  ```

- `rebuild` is O(n × links); called on every vault scan completion and file-change event
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Cross-document link graph requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `RefGraph tracks all outgoing links per document` |
| [[bdd/features/wiki-links]] | `RefGraph reports unresolved refs for broken links` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/resolution/ref-graph.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Wiki-link resolution modes and binding strategy |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- Nothing — RefGraph depends only on VaultIndex/FolderLookup types which are complete from Phase 4

**Unblocks:**

- [[tickets/TASK-060]] — DiagnosticService queries RefGraph for unresolved and ambiguous refs
- [[tickets/TASK-062]] — ReferencesService queries RefGraph for refs by DefKey

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
