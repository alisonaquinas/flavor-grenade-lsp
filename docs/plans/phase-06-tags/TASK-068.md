---
id: "TASK-068"
title: "Build tag index during vault scan"
type: task
status: open
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-067"]
tags: [tickets/task, "phase/6"]
aliases: ["TASK-068"]
---

# Build tag index during vault scan

> [!INFO] `TASK-068` · Task · Phase 6 · Parent: [[tickets/FEAT-007]] · Status: `open`

## Description

Integrate `TagRegistry` into the `VaultScanner` initial scan and into `FileWatcher` incremental update events. On initial scan, call `TagRegistry.rebuild()` after the vault index is populated. On `FileWatcher` events (create, change, delete), perform incremental updates: remove all occurrences for the changed `DocId`, then add back from the updated `OFMDoc`. This ensures the tag index stays in sync with vault state at all times without requiring a full rebuild on every file change.

---

## Implementation Notes

- Wire `TagRegistry` into `VaultScanner` — inject via DI or pass as a dependency
- After initial scan completes: call `tagRegistry.rebuild(vaultIndex)`
- On `FileWatcher` `change` event: remove old occurrences for the `DocId`, parse the new document, and add new occurrences
- On `FileWatcher` `delete` event: remove all occurrences for the deleted `DocId`
- On `FileWatcher` `create` event: parse the new document and add occurrences
- See also: [[design/vault-scanner]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Tag index kept in sync with vault state | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/tags]] | `Tag index updates on file change` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-vault-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Tag handling is scoped to OFM syntax only |

---

## Parent Feature

[[tickets/FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-067]] — TagRegistry must exist before it can be wired into VaultScanner

**Unblocks:**

- [[tickets/TASK-069]] — tag completion requires a populated TagRegistry

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
- [ ] Parent feature [[tickets/FEAT-007]] child task row updated to `in-review`

---

## Notes

Incremental updates (per-document removal then re-add) are preferred over full rebuilds on every file change to avoid O(n) cost on large vaults.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-007]].
