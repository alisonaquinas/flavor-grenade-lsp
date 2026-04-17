---
id: "TASK-050"
title: "Implement FileWatcher"
type: task
status: open
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-047", "TASK-048"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-050"]
---

# Implement FileWatcher

> [!INFO] `TASK-050` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Create `src/vault/file-watcher.ts`. The `FileWatcher` uses `Bun.watch()` to monitor the vault root for filesystem changes in real time. On `onCreate`/`onModify` it re-parses the affected file, updates `VaultIndex`, rebuilds `FolderLookup`, and re-runs diagnostics on all files that link to it. On `onDelete` it removes the document from `VaultIndex`, rebuilds `FolderLookup`, and emits FG001 diagnostics for all files that previously linked to it. Rename events are treated as delete-old plus create-new. Per ADR013, all watcher events for paths outside the vault root must be silently ignored.

---

## Implementation Notes

- Key interface:

  ```typescript
  export class FileWatcher {
    start(vaultRoot: string, handler: FileChangeHandler): void;
    stop(): void;
  }

  export interface FileChangeHandler {
    onCreate(path: string): Promise<void>;
    onModify(path: string): Promise<void>;
    onDelete(path: string): Promise<void>;
    onRename(oldPath: string, newPath: string): Promise<void>;
  }
  ```

- **Vault root confinement obligation (ADR013)**: before processing any event path, verify the path is within `vaultRoot`. Silently discard events for paths outside the vault root — never access, parse, or emit diagnostics for files outside the vault root boundary
- See also: [[adr/ADR013-vault-root-confinement]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Real-time index update requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `Server updates index when file is created` |
| [[bdd/features/workspace]] | `Server updates index when file is modified` |
| [[bdd/features/workspace]] | `Server removes document from index when file is deleted` |
| [[bdd/features/workspace]] | `Server handles file rename` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/file-watcher.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All filesystem access must be confined to the detected vault root; watcher events for paths outside vault root must be ignored |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-047]] — VaultIndex must exist to be updated on events
- [[tickets/TASK-048]] — FolderLookup must exist to be rebuilt on events

**Unblocks:**

- [[tickets/TASK-054]] — VaultModule registers FileWatcher as a provider

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

Vault root confinement is a hard security requirement per ADR013. Every event path must be checked against the vault root before any filesystem operation is performed on it.

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
