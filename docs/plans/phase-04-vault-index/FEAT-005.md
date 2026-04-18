---
id: "FEAT-005"
title: "Vault Index"
type: feature
status: done
priority: "high"
phase: "4"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-004"]
tags: [tickets/feature, "phase/4"]
aliases: ["FEAT-005"]
---

# Vault Index

> [!INFO] `FEAT-005` · Feature · Phase 4 · Priority: `high` · Status: `draft`

## Goal

Vault authors working with multi-document vaults gain a server that understands the shape of their vault: it detects the vault root automatically, scans and indexes every document at startup, watches for filesystem changes in real time, and exposes cross-file lookup primitives so that wiki-link navigation, diagnostics, and completions can work across the entire vault without manual configuration.

---

## Scope

**In scope:**

- Vault root detection via `.obsidian/` directory or `.flavor-grenade.toml` marker
- Recursive initial scan of all `.md` files in the vault root
- Real-time filesystem watching via `Bun.watch()`
- `.gitignore` / `.ignore` pattern filtering during scan and watch
- In-memory `VaultIndex` and `FolderLookup` suffix-tree for name-based lookup
- Single-file mode fallback when no vault marker is found
- `flavorGrenade/awaitIndexReady` custom request for test synchronization

**Out of scope (explicitly excluded):**

- Wiki-link resolution and diagnostics (Phase 5)
- Tag indexing (Phase 6)
- Embed resolution (Phase 7)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Vault awareness requirements defined in Phase 4 | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault index requirements defined in Phase 4 | [[requirements/index]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/vault-detection]] | Vault root detection scenarios across all detection modes |
| [[bdd/features/workspace]] | Multi-document workspace scan and watch scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-04-vault-index]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] `bun test src/vault/` passes with all tests green
- [ ] `vault-detection.feature` all scenarios pass
- [ ] `workspace.feature` all scenarios pass
- [ ] All linked BDD feature files pass in CI
- [ ] All linked Planguage requirement tags have `✅ passing` rows in [[test/matrix]]
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]])
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-045]] | Implement VaultDetector | `done` |
| [[tickets/TASK-046]] | Define DocId value type | `done` |
| [[tickets/TASK-047]] | Implement VaultIndex | `done` |
| [[tickets/TASK-048]] | Implement FolderLookup suffix tree | `done` |
| [[tickets/TASK-049]] | Implement VaultScanner | `done` |
| [[tickets/TASK-050]] | Implement FileWatcher | `done` |
| [[tickets/TASK-051]] | Implement .gitignore/.ignore filtering | `done` |
| [[tickets/TASK-052]] | Implement single-file mode fallback | `done` |
| [[tickets/TASK-053]] | Implement flavorGrenade/awaitIndexReady request | `done` |
| [[tickets/TASK-054]] | Register vault services in VaultModule | `done` |
| [[tickets/TASK-055]] | Write unit tests for VaultDetector | `done` |
| [[tickets/TASK-056]] | Write unit tests for FolderLookup | `done` |
| [[tickets/CHORE-010]] | Phase 4 Lint Sweep | `done` |
| [[tickets/CHORE-011]] | Phase 4 Code Quality Sweep | `done` |
| [[tickets/CHORE-012]] | Phase 4 Security Sweep | `done` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-004]] — Phase 3 (OFM Parser) must be complete before vault-aware features can be built

**Unblocks:**

- [[tickets/FEAT-006]] — Phase 5 (Wiki-Link Resolution) depends on the VaultIndex and FolderLookup primitives

---

## Notes

ADR references:

- [[adr/ADR003-vault-detection]] — vault detection algorithm and marker precedence
- [[adr/ADR013-vault-root-confinement]] — all filesystem access must be confined to the detected vault root

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.

> [!CHECK] In-review — 2026-04-17
> All 12 TASK + 3 CHORE tickets done. 150 unit tests pass, 3 integration tests pass. Lint clean, tsc clean. Status: `in-review`.

## Retrospective

> Written after Step L passes. Date: 2026-04-17.

### What went as planned

- TDD red-green process followed strictly: 3 RED commits followed by 3 GREEN commits
- All TASK implementations matched the spec shapes exactly
- `ignore` npm package was already installed — no `bun add` needed
- `@Global()` on `TransportModule` solved the dispatcher singleton problem cleanly
- Vault-root confinement (ADR013) applied in FileWatcher with path separator guard

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| TASK-055 | Test fix | `no-markers` fixture walks up tree to project root's `.flavor-grenade.toml` — had to use `os.tmpdir()` isolated directory | Low |
| TASK-054 | DI fix | `VaultScanner` injecting `StatusNotifier` caused NestJS resolution failure since `StatusNotifier` is in `LspModule` not `VaultModule`; resolved by injecting `JsonRpcDispatcher` directly | Medium |
| TASK-054 | Integration regression | `TransportModule` without `@Global()` created duplicate dispatcher/reader instances; adding `@Global()` fixed it | Medium |

### Process observations

- Splitting `TransportModule` from `LspModule` early in GREEN-3 was the right call — it cleanly broke the potential circular dependency between `LspModule` and `VaultModule`
- The vault-detection test caching behaviour required a design decision: the `VaultDetector` caches on the _instance_, so `beforeEach` creates fresh instances, making caching tests work correctly by checking same reference on second call with different arg
- Windows path handling (forward slash normalization in `toDocId`, URI-to-path in `SingleFileModeGuard`) needed explicit handling

### Carry-forward actions

- [ ] Phase 5 (wiki-link resolution) will use `FolderLookup.lookupByStem` and `lookupByPath` — test at integration level before wiring
- [ ] `VaultScanner` sends `flavorGrenade/status 'ready'` directly via dispatcher; consider centralising all status notifications through a `StatusNotifier` that lives in `TransportModule` instead of `LspModule` (avoids DI complexity for future phases)

### Rule / template amendments

- [ ] Add rule: when injecting cross-module services in NestJS, prefer `TransportModule`-level providers over `LspModule`-level for services used by multiple modules
