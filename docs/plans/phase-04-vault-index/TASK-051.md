---
id: "TASK-051"
title: "Implement .gitignore/.ignore filtering"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-045"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-051"]
---

# Implement .gitignore/.ignore filtering

> [!INFO] `TASK-051` · Task · Phase 4 · Parent: [[FEAT-005]] · Status: `open`

## Description

Create `src/vault/ignore-filter.ts`. The `IgnoreFilter` reads `.gitignore` from the vault root and also supports `.ignore` files. It uses the `ignore` npm package to evaluate whether a given vault-relative path should be excluded from the index. This filter is called by `VaultScanner` during the initial scan and by `FileWatcher` when processing events, to prevent indexing of files the user has explicitly excluded.

---

## Implementation Notes

- Key interface:

  ```typescript
  export class IgnoreFilter {
    load(vaultRoot: string): Promise<void>;
    isIgnored(relativePath: string): boolean;
  }
  ```

- Uses the `ignore` npm package (`bun add ignore`)
- Reads `.gitignore` from vault root; also reads `.ignore` from vault root if present
- `isIgnored` receives a vault-root-relative path (not absolute)
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | File exclusion requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/workspace.feature` | `Server respects .gitignore exclusions` |
| `bdd/features/workspace.feature` | `Server respects .ignore exclusions` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/ignore-filter.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault root is the anchor for all relative path evaluation |

---

## Parent Feature

[[FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[TASK-045]] — VaultDetector must resolve vault root path before IgnoreFilter can load

**Unblocks:**

- [[TASK-049]] — VaultScanner uses IgnoreFilter during recursive walk

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
- [ ] Parent feature [[FEAT-005]] child task row updated to `in-review`

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
> Ticket created. Status: `open`. Parent: [[FEAT-005]].

> [!SUCCESS] Done — 2026-04-17
> `src/vault/ignore-filter.ts` implemented. Uses 'ignore' npm package (types bundled). Reads .gitignore and .ignore from vault root. Always excludes .obsidian/ prefix. All 6 tests pass. Status: `done`.
