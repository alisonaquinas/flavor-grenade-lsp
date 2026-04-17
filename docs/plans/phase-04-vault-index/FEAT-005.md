---
id: "FEAT-005"
title: "Vault Index"
type: feature
status: in-progress
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
| [[tickets/TASK-045]] | Implement VaultDetector | `open` |
| [[tickets/TASK-046]] | Define DocId value type | `open` |
| [[tickets/TASK-047]] | Implement VaultIndex | `open` |
| [[tickets/TASK-048]] | Implement FolderLookup suffix tree | `open` |
| [[tickets/TASK-049]] | Implement VaultScanner | `open` |
| [[tickets/TASK-050]] | Implement FileWatcher | `open` |
| [[tickets/TASK-051]] | Implement .gitignore/.ignore filtering | `open` |
| [[tickets/TASK-052]] | Implement single-file mode fallback | `open` |
| [[tickets/TASK-053]] | Implement flavorGrenade/awaitIndexReady request | `open` |
| [[tickets/TASK-054]] | Register vault services in VaultModule | `open` |
| [[tickets/TASK-055]] | Write unit tests for VaultDetector | `open` |
| [[tickets/TASK-056]] | Write unit tests for FolderLookup | `open` |
| [[tickets/CHORE-010]] | Phase 4 Lint Sweep | `open` |
| [[tickets/CHORE-011]] | Phase 4 Code Quality Sweep | `open` |
| [[tickets/CHORE-012]] | Phase 4 Security Sweep | `open` |

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
