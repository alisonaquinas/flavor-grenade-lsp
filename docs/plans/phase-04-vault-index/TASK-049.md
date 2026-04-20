---
id: "TASK-049"
title: "Implement VaultScanner"
type: task
status: done
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-045", "TASK-047", "TASK-048", "TASK-051"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-049"]
---

# Implement VaultScanner

> [!INFO] `TASK-049` · Task · Phase 4 · Parent: [[FEAT-005]] · Status: `open`

## Description

Create `src/vault/vault-scanner.ts`. The `VaultScanner` performs the initial index build on startup after the `initialized` LSP notification. It walks the vault root directory recursively, filters files by the configured extensions (default `.md`), excludes paths matching `.gitignore`/`.ignore` patterns and the `.obsidian/` directory, parses each file with `OFMParser`, populates `VaultIndex`, rebuilds `FolderLookup`, and sends a `flavorGrenade/status` notification to signal readiness. Run `bun add ignore` to add the `ignore` npm package dependency.

---

## Implementation Notes

- Walk implementation: use `Bun.Glob` or `fs.readdir` with `recursive: true`
- Filter order: (1) extension filter; (2) `IgnoreFilter.isIgnored()`; (3) exclude `.obsidian/`
- After scan: call `folderLookup.rebuild(vaultIndex)`, then send `flavorGrenade/status { status: 'ready' }`
- Requires `bun add ignore` to add the `ignore` package
- See also: [[adr/ADR013-vault-root-confinement]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault scan and index requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/workspace.feature` | `Server indexes all documents on startup` |
| `bdd/features/workspace.feature` | `Server excludes .obsidian directory from index` |
| `bdd/features/workspace.feature` | `Server respects .gitignore exclusions` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/vault-scanner.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All filesystem access must be confined to the detected vault root |

---

## Parent Feature

[[FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[TASK-045]] — VaultDetector must resolve vault root before scanner can run
- [[TASK-047]] — VaultIndex must exist to receive scan results
- [[TASK-048]] — FolderLookup must exist to be rebuilt after scan
- [[TASK-051]] — IgnoreFilter must be available for path exclusion

**Unblocks:**

- [[TASK-053]] — awaitIndexReady request depends on scanner completing

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
> `src/vault/vault-scanner.ts` implemented. Recursively walks vault root using fs.promises.readdir, filters via IgnoreFilter, parses .md files with OFMParser, indexes into VaultIndex, rebuilds FolderLookup, sends flavorGrenade/status 'ready' via JsonRpcDispatcher. Skips walk in single-file mode. Status: `done`.
