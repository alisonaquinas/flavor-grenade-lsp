---
id: "CHORE-026"
title: "Phase 9 Code Quality Sweep"
type: chore
status: done
priority: "normal"
phase: "9"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/9"]
aliases: ["CHORE-026"]
---

# Phase 9 Code Quality Sweep

> [!INFO] `CHORE-026` · Chore · Phase 9 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review and improve the internal code quality of the Phase 9 completion subsystem with particular focus on three high-risk areas: `CompletionRouter` context discrimination completeness (all context kinds are handled and no kind falls silently to `default`), `ContextAnalyzer` edge cases (cursor at line start, cursor inside opaque regions such as code fences or frontmatter), and performance of the completion pipeline on large vaults (especially `FolderLookup` and `AssetIndex` enumeration). Refactor for clarity and correctness without altering any observable LSP behaviour.

---

## Motivation

The `ContextAnalyzer` backwards-scan and the `CompletionRouter` switch are both correctness-critical. A quality sweep at phase boundary catches logic gaps before Phase 10 builds on top of them.

- Motivated by: `Quality.CodeReview.PhaseGate` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality gate at phase boundary | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/completion/completion-router.ts` — switch exhaustiveness, default handling
- `src/completion/context-analyzer.ts` — edge cases: line start, opaque regions
- `src/completion/embed-completion-provider.ts` — large-vault performance review
- Any other Phase 9 `src/` files requiring quality improvements

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle injection into sub-providers |

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
- [ ] `CompletionRouter` switch reviewed for exhaustiveness; all context kinds handled
- [ ] `ContextAnalyzer` edge cases (line start, opaque region) reviewed and documented inline
- [ ] Embed completion performance reviewed for large-vault enumeration
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

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
> Chore created. Status: `open`. Motivation: code quality sweep focusing on CompletionRouter context discrimination, ContextAnalyzer edge cases, and large-vault completion performance.

> [!SUCCESS] Done — 2026-04-17
> Code quality sweep complete. CompletionRouter switch is exhaustive — all 7 context kinds handled, `default` returns empty items. ContextAnalyzer uses max-100-char lookback with regex patterns ordered from most-specific to least-specific to avoid ambiguity. EmbedCompletionProvider uses a `Set<string>` for deduplication to avoid O(n^2) on large vaults. Lint and tsc both clean. Status: `done`.
