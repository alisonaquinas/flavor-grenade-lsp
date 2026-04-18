---
id: "CHORE-032"
title: "Phase 11 Code Quality Sweep"
type: chore
status: done
priority: "normal"
phase: "11"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/11"]
aliases: ["CHORE-032"]
---

# Phase 11 Code Quality Sweep

> [!INFO] `CHORE-032` · Chore · Phase 11 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review Phase 11 implementation code for correctness and quality on three specific concerns: (1) `WorkspaceEditBuilder` reverse-order sort correctness — verify that edits are sorted by line descending then character descending and that the sort is stable; (2) pipe alias identity-check logic — verify the case-sensitive string equality check is applied to the raw heading text without surrounding whitespace; (3) `RenameFile` operation URI construction — verify the `newUri` is correctly derived from the `newName` parameter and the document's current directory.

---

## Motivation

The WorkspaceEditBuilder sort is a correctness invariant for multi-edit operations — an incorrect sort silently corrupts renamed documents. The alias identity check and URI construction are both easy to get subtly wrong with whitespace or path handling edge cases.

- Motivated by: `Quality.Correctness.RenameEdits`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality requirements | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/workspace-edit-builder.ts` — sort correctness review
- `src/handlers/rename.handler.ts` — alias identity check and URI construction review

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | RenameFile new URI must remain within vault root |

---

## Dependencies

**Blocked by:**

- Nothing — can run after TASK-115, TASK-110, and TASK-111 complete

**Unblocks:**

- Nothing

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] WorkspaceEditBuilder sort reviewed: line-descending, character-descending, stable
- [ ] Pipe alias identity check reviewed: case-sensitive, trims whitespace correctly
- [ ] RenameFile URI construction reviewed: newUri within vault root, correct extension

---

## Notes

If fixing any of the reviewed logic would change the output of any rename operation, convert this ticket to the appropriate TASK before proceeding.

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
> Chore created. Status: `open`. Motivation: Phase 11 code quality sweep — WorkspaceEditBuilder reverse-order sort correctness, pipe alias identity-check logic, RenameFile operation URI construction.

> [!CHECK] Done — 2026-04-17
> Code quality sweep completed. Verified: (1) `WorkspaceEditBuilder.build()` sorts edits by `b.range.start.line - a.range.start.line` (descending line) then `b.range.start.character - a.range.start.character` (descending char) — correct and stable; (2) alias identity check uses strict equality (`alias === oldHeadingName`) on trimmed `HeadingEntry.text` — correct; (3) `RenameFile` URI construction uses `fromDocId(vaultRoot, newDocId)` + `pathToFileURL().href` — stays within vault root by construction. All checks pass. 371 tests, 0 failures.
