---
id: "CHORE-020"
title: "Phase 7 Code Quality Sweep"
type: chore
status: done
priority: normal
phase: 7
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/7"]
aliases: ["CHORE-020"]
---

# Phase 7 Code Quality Sweep

> [!INFO] `CHORE-020` · Chore · Phase 7 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all Phase 7 source files for code quality issues and resolve them without altering observable LSP behaviour. Focus areas: the separation between `AssetIndex` and `VaultIndex` (they must remain distinct concerns), correctness of hover content sanitisation (no server paths, no raw content leaks), and correctness of the size-specifier regex parsing (edge cases like `0`, `200x`, or mixed alphanumeric input).

---

## Motivation

Phase 7 introduces `AssetIndex` alongside the existing `VaultIndex`. Blurring the boundary between these two indexes could cause correctness issues in resolution. The hover handler constructs user-visible content that must be sanitised. The size-specifier regex must not accept pathological inputs.

- Motivated by: [[requirements/code-quality]], AssetIndex/VaultIndex separation review

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | AssetIndex vs VaultIndex separation | [[requirements/code-quality]] |
| — | Hover content sanitisation | [[requirements/code-quality]] |
| — | Size-specifier parsing correctness | [[requirements/embed-resolution]] |

---

## Scope of Change

**Files modified:**

- `src/vault/vault-scanner.ts` — AssetIndex/VaultIndex boundary review
- `src/handlers/hover.handler.ts` — hover content sanitisation review
- `src/resolution/embed-resolver.ts` — size-specifier parsing edge cases
- Any Phase 7 file with identified quality issues

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | AssetIndex must enforce vault root confinement |

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] AssetIndex and VaultIndex remain clearly separated concerns
- [ ] Hover content verified sanitised (no server-local paths)
- [ ] Size-specifier regex edge cases reviewed and handled
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

Focus: AssetIndex vs VaultIndex separation, hover content sanitization, size-specifier parsing correctness.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: code quality sweep for Phase 7 — AssetIndex vs VaultIndex separation, hover content sanitisation, size-specifier parsing correctness.

> [!SUCCESS] Done — 2026-04-17
> Code quality verified: `AssetIndex` stored as `Set<string>` separate from `VaultIndex` (no mixing). `EmbedResolver` uses only the Set lookup — no raw fs calls. `EmbedParser` size-specifier parsing verified correct (already implemented in Phase 3). `HoverHandler` generates preview from `headings` index (no raw text needed). Status: `done`.
