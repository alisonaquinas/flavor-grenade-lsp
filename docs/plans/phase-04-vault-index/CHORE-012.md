---
id: "CHORE-012"
title: "Phase 4 Security Sweep"
type: chore
status: done
priority: "high"
phase: "4"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["CHORE-011"]
tags: [tickets/chore, "phase/4"]
aliases: ["CHORE-012"]
---

# Phase 4 Security Sweep

> [!INFO] `CHORE-012` · Chore · Phase 4 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 4 vault module source files for security vulnerabilities, with particular focus on three areas mandated by ADR013: path traversal prevention in `VaultScanner` (ensure no file outside the vault root can be read), `IgnoreFilter` preventing access outside vault root (verify that ignored-path evaluation cannot be bypassed), and `FileWatcher` silently discarding events for paths outside the vault root (verify the confinement check is present and correct in all event handlers).

---

## Motivation

Phase 4 is the first phase to perform real filesystem access. ADR013 establishes that all filesystem operations must be confined to the detected vault root. A dedicated security sweep verifies these invariants hold before Phase 5 builds on top of them.

- Motivated by: [[adr/ADR013-vault-root-confinement]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault root confinement security requirement | [[requirements/index]] |

---

## Scope of Change

**Files modified:**

- `src/vault/vault-scanner.ts` — verify path traversal prevention
- `src/vault/ignore-filter.ts` — verify no bypass of vault root boundary
- `src/vault/file-watcher.ts` — verify out-of-root event discard in all handlers

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | All filesystem access must be confined to the detected vault root; path traversal must be impossible; watcher events for out-of-root paths must be silently ignored |

---

## Dependencies

**Blocked by:**

- [[CHORE-011]] — code quality sweep must be done before security review

**Unblocks:**

- Nothing in Phase 4 — this is the final sweep before the phase gate

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] `VaultScanner` cannot read files outside `vaultRoot` (path traversal via `../` or absolute path injection is blocked)
- [ ] `IgnoreFilter` cannot be bypassed to allow access outside vault root
- [ ] `FileWatcher` silently ignores all events for paths outside `vaultRoot` in all four event handlers
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no behaviour-affecting files; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run `bun test` periodically; if scope grows, update list and log |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; lint+type+test pass | Verify Acceptance Criteria; confirm no `src/` behaviour changes; update matrix/index if needed |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]`; revert uncommitted partial changes if needed |

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: Phase 4 security sweep covering path traversal in VaultScanner (ADR013), IgnoreFilter boundary enforcement, and FileWatcher out-of-root event discard.

> [!SUCCESS] Done — 2026-04-17
> VaultScanner: `walkAndIndex` only follows paths returned by `fs.readdir` (OS-controlled) from vault root downward — no user-controlled path injection possible. IgnoreFilter: only evaluates vault-relative paths; cannot bypass vault root boundary. FileWatcher: confinement check updated to use `path.sep` separator after `resolvedRoot` to prevent `vaultRoot`-prefixed sibling-directory bypass (e.g., `/vault-other` would not match `/vault`). No absolute paths in error messages. Status: `done`.
