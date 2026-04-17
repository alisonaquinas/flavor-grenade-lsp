---
id: "TASK-054"
title: "Register vault services in VaultModule"
type: task
status: open
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-045", "TASK-046", "TASK-047", "TASK-048", "TASK-049", "TASK-050", "TASK-051", "TASK-052", "TASK-053"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-054"]
---

# Register vault services in VaultModule

> [!INFO] `TASK-054` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Create `src/vault/vault.module.ts`. This NestJS module (or equivalent dependency injection container) declares and exports all vault services as providers: `VaultDetector`, `VaultIndex`, `FolderLookup`, `VaultScanner`, `FileWatcher`, and `IgnoreFilter`. Exporting all providers makes them injectable in Phase 5 feature modules (`ResolutionModule`, `DiagnosticsModule`, `CompletionModule`).

---

## Implementation Notes

- Create `src/vault/vault.module.ts` with providers: `VaultDetector`, `VaultIndex`, `FolderLookup`, `VaultScanner`, `FileWatcher`, `IgnoreFilter`
- Export all providers for use by downstream modules
- Wire startup sequence: on `initialized` notification, call `VaultDetector.detect()`, then conditionally start `VaultScanner` (full vault mode) or configure single-file mode
- Register `flavorGrenade/awaitIndexReady` request handler
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Module composition requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/workspace]] | `All vault services are available to feature modules` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/vault-module.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Vault lifecycle and module initialization order |
| [[adr/ADR013-vault-root-confinement]] | VaultModule startup must establish vault root before any file access |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-045]] through [[tickets/TASK-053]] — all vault service implementations must be complete

**Unblocks:**

- [[tickets/FEAT-006]] — Phase 5 Wiki-Link Resolution depends on vault services exported from VaultModule

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
