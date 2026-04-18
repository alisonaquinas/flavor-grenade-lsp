---
id: "CHORE-017"
title: "Phase 6 Code Quality Sweep"
type: chore
status: done
priority: normal
phase: 6
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/6"]
aliases: ["CHORE-017"]
---

# Phase 6 Code Quality Sweep

> [!INFO] `CHORE-017` · Chore · Phase 6 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all Phase 6 source files for code quality issues and resolve them without altering observable LSP behaviour. Focus areas: correctness of `TagRegistry` incremental update logic (per-document removal then re-add) vs full rebuild trade-offs, and completeness of the unicode tag regex — ensuring that valid OFM tag characters outside the ASCII range are handled correctly.

---

## Motivation

Phase 6 introduces `TagRegistry` with both `rebuild()` and incremental update paths. Subtle bugs in incremental update correctness (e.g., stale occurrences after a file change) or unicode regex gaps could cause silent data loss or incorrect completions in real vaults.

- Motivated by: [[requirements/code-quality]], incremental update correctness review

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | TagRegistry incremental update correctness | [[requirements/code-quality]] |
| — | Unicode tag regex coverage | [[requirements/tag-indexing]] |

---

## Scope of Change

**Files modified:**

- `src/tags/tag-registry.ts` — incremental update correctness and unicode regex fixes
- Any Phase 6 file with identified quality issues

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | OFM tag character rules govern regex scope |

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
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] Incremental update path verified correct: no stale occurrences after file change or delete

---

## Notes

Focus: TagRegistry incremental update correctness vs full rebuild, unicode tag regex coverage.

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
> Chore created. Status: `open`. Motivation: code quality sweep for Phase 6 — incremental update correctness and unicode tag regex coverage.

> [!SUCCESS] Done — 2026-04-17
> Code quality sweep complete. TagRegistry.removeDoc() correctly filters out all
> occurrences by docId before re-indexing on addDoc() — no stale occurrences possible.
> Unicode tag character handling delegates to TagParser (already validated in Phase 5);
> TagRegistry stores and queries the already-parsed `TagEntry.tag` strings verbatim.
> No code changes required. 225 tests pass; lint and tsc clean.
