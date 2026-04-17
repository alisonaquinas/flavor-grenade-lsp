---
id: "TASK-046"
title: "Define DocId value type"
type: task
status: open
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/4"]
aliases: ["TASK-046"]
---

# Define DocId value type

> [!INFO] `TASK-046` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Create `src/vault/doc-id.ts`. `DocId` is a branded string representing a vault-root-relative path without extension. This value type prevents accidental confusion between absolute paths, relative paths, and document identifiers throughout the codebase. Provide constructor and destructor functions for converting between `DocId` and absolute filesystem paths.

---

## Implementation Notes

- Key interface:

  ```typescript
  export type DocId = string & { readonly __brand: 'DocId' };

  export function toDocId(vaultRoot: string, absolutePath: string): DocId;
  export function fromDocId(vaultRoot: string, docId: DocId): string;  // returns absolute path
  ```

- Example: vault root `/home/user/vault`, file `/home/user/vault/notes/alpha.md` → `DocId("notes/alpha")`
- The brand ensures TypeScript will not accept a plain `string` where a `DocId` is expected
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Document identity requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/vault-detection]] | `DocId is computed relative to vault root` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/doc-id.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault root anchoring for all document identifiers |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- Nothing — this is a foundational type with no runtime dependencies

**Unblocks:**

- [[tickets/TASK-047]] — VaultIndex uses DocId as its key type
- [[tickets/TASK-048]] — FolderLookup returns LookupResult containing DocId

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

This task is a pure type/utility definition. Implementation should be trivial; the value is the compile-time safety the brand provides.

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
