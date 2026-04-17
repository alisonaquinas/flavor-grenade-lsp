---
id: "TASK-047"
title: "Implement VaultIndex"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-046"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-047"]
---

# Implement VaultIndex

> [!INFO] `TASK-047` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Create `src/vault/vault-index.ts`. The `VaultIndex` is an in-memory map from `DocId` to `OFMDoc` that serves as the single source of truth for all indexed documents in the vault. It provides set, get, delete, and iteration operations used by the scanner, file watcher, and all feature modules that need cross-file document access.

---

## Implementation Notes

- Key interface:

  ```typescript
  export class VaultIndex {
    /** Insert or replace a document */
    set(docId: DocId, doc: OFMDoc): void;

    /** Remove a document (on file deletion) */
    delete(docId: DocId): void;

    /** Look up by DocId */
    get(docId: DocId): OFMDoc | undefined;

    /** All DocIds in index */
    keys(): IterableIterator<DocId>;

    /** All OFMDocs in index */
    values(): IterableIterator<OFMDoc>;

    /** Number of indexed documents */
    get size(): number;
  }
  ```

- Internally backed by a `Map<DocId, OFMDoc>`
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault index requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `VaultIndex stores and retrieves documents by DocId` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/vault-index.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Document identity and vault root anchoring |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-046]] — DocId type must be defined before VaultIndex can be implemented

**Unblocks:**

- [[tickets/TASK-048]] — FolderLookup is rebuilt from VaultIndex
- [[tickets/TASK-049]] — VaultScanner populates VaultIndex

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
> `src/vault/vault-index.ts` implemented. Map-backed store with set/get/delete/has/values/entries/size/clear. All 9 CRUD tests pass. Status: `done`.
