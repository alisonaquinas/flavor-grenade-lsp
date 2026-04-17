---
id: "CHORE-011"
title: "Phase 4 Code Quality Sweep"
type: chore
status: open
priority: "high"
phase: "4"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["CHORE-010"]
tags: [tickets/chore, "phase/4"]
aliases: ["CHORE-011"]
---

# Phase 4 Code Quality Sweep

> [!INFO] `CHORE-011` · Chore · Phase 4 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review and improve the internal code quality of all Phase 4 vault module source files after the lint sweep is complete. Focus areas: `VaultScanner` async correctness (proper `await` usage, no fire-and-forget Promises, backpressure handling), `FileWatcher` event handler coverage (all four events handled without unhandled-rejection risk), and `FolderLookup` trie correctness (edge cases for empty vault, single-file vault, and Unicode stems).

---

## Motivation

Phase 4 introduces async-heavy code (`VaultScanner`, `FileWatcher`) and a non-trivial data structure (`FolderLookup` trie). A dedicated quality sweep after all tasks are done reduces the risk of subtle async bugs and trie edge-case failures slipping through to Phase 5 work.

- Motivated by: `Quality.CodeReview.PhaseGate` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality gate | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/vault/vault-scanner.ts` — async correctness review
- `src/vault/file-watcher.ts` — event handler coverage review
- `src/vault/folder-lookup.ts` — trie correctness review

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | No refactoring may weaken path-safety checks in scanner or watcher |

---

## Dependencies

**Blocked by:**

- [[tickets/CHORE-010]] — lint sweep must be clean before quality review

**Unblocks:**

- [[tickets/CHORE-012]] — security sweep follows code quality sweep

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] `VaultScanner` has no unhandled Promise rejections in normal operation
- [ ] `FileWatcher` handles all four events (`onCreate`, `onModify`, `onDelete`, `onRename`) without unhandled-rejection risk
- [ ] `FolderLookup` trie handles empty vault, single-document vault, and Unicode stems without error
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
> Chore created. Status: `open`. Motivation: Phase 4 code quality sweep focusing on VaultScanner async correctness, FileWatcher event handler coverage, and FolderLookup trie correctness.
