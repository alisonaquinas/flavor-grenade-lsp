---
id: "CHORE-027"
title: "Phase 9 Security Sweep"
type: chore
status: done
priority: "normal"
phase: "9"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/9"]
aliases: ["CHORE-027"]
---

# Phase 9 Security Sweep

> [!INFO] `CHORE-027` · Chore · Phase 9 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Audit all Phase 9 completion code for security concerns with focus on two areas: completion trigger strings (the values from `ContextAnalyzer` such as `[[`, `![[`, `#`, `> [!`) must never be used in filesystem operations, and the callout type list (from `STANDARD_CALLOUT_TYPES`) must be verified as hardcoded and not sourced from any user-controlled configuration or document content.

---

## Motivation

Completion trigger strings are derived from user cursor context. If any trigger string or prefix were passed into a filesystem API, a crafted document could potentially escape the vault root. Additionally, the standard callout type list must be immutable and not influenced by user input.

- Motivated by: `Security.InputValidation.CompletionTriggers` (see [[requirements/security/index]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Completion trigger strings must not reach filesystem operations | [[requirements/security/index]] |

---

## Scope of Change

**Files modified:**

- `src/completion/context-analyzer.ts` — confirm trigger strings are never used in filesystem APIs
- `src/completion/callout-completion-provider.ts` — confirm `STANDARD_CALLOUT_TYPES` is hardcoded constant
- Any other Phase 9 `src/` files that handle trigger strings or completion inputs

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

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
- [ ] Confirmed: no completion trigger string or cursor-derived prefix is ever passed to a filesystem API
- [ ] Confirmed: `STANDARD_CALLOUT_TYPES` is a hardcoded `as const` array not derived from config or user input
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

Custom callout types (from `CalloutEntry[]` in vault documents) are enumerated from already-indexed vault content and are acceptable as completion labels. The concern is specifically that the `STANDARD_CALLOUT_TYPES` constant remains hardcoded and that no trigger string reaches a filesystem path-building call.

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
> Chore created. Status: `open`. Motivation: security sweep confirming completion trigger strings are not used in filesystem operations and callout type list is hardcoded.

> [!SUCCESS] Done — 2026-04-17
> Security sweep complete. Confirmed: no completion trigger string or cursor-derived prefix is passed to any filesystem API. All completion providers operate purely on in-memory data (VaultIndex, FolderLookup, TagRegistry, ParseCache, VaultScanner.assetIndex). `STANDARD_CALLOUTS` in `callout-completion-provider.ts` is a hardcoded `readonly string[]` constant — not derived from config or user input. Custom callout types come from already-indexed `CalloutEntry.type` values (safe). Status: `done`.
