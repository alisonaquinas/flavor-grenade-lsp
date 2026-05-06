---
id: "CHORE-052"
title: "Phase 16 Security Sweep"
type: chore
status: open
priority: high
phase: 16
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-174"]
tags: [tickets/chore, "phase/16"]
aliases: ["CHORE-052"]
---

# Phase 16 Security Sweep

> [!INFO] `CHORE-052` · Chore · Phase 16 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Review the completed Phase 16 file operation implementation for vault
confinement risks. Confirm source and target paths are canonicalized, escaping
moves are rejected before edits are returned, folder expansion cannot write
outside the vault, and `didRenameFiles` refresh ignores unsafe paths.

---

## Motivation

File operation requests carry client-provided paths. The phase must not create
WorkspaceEdits that rewrite references for paths outside the configured vault.

- Motivated by: `Security.Vault.PathConfinement`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Security.Vault.PathConfinement` | Canonicalize and vault-root-check every old and new path | [[requirements/security/vault-confinement]] |
| `Security.Vault.RenameConfinement` | Cancel rename and move edits that escape the vault root | [[requirements/security/vault-confinement]] |

---

## Scope of Change

**Files modified:**

- Phase 16 implementation and tests — security-only fixes if review finds gaps

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | File operation refactors must stay vault confined |

---

## Dependencies

**Blocked by:**

- [[TASK-174]] — security sweep reviews the completed Phase 16 implementation

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Escaping source paths are covered by tests and refused
- [ ] Escaping target paths are covered by tests and refused
- [ ] Folder moves cannot generate edits outside the vault root
- [ ] `didRenameFiles` refresh ignores or rejects unsafe paths
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes
- [ ] No unrelated behaviour changes in `src/`

---

## Notes

This sweep should produce either no code changes or narrowly scoped security
fixes tied to the Phase 16 path confinement requirements.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP
> method, stop and convert this ticket to a `TASK-NNN` before making that
> change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened — 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-16 security sweep.
