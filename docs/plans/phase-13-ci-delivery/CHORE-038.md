---
id: "CHORE-038"
title: "Phase 13 Code Quality Sweep"
type: chore
status: open
priority: medium
phase: 13
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/13"]
aliases: ["CHORE-038"]
---

# Phase 13 Code Quality Sweep

> [!INFO] `CHORE-038` · Chore · Phase 13 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review and improve internal code quality across all Phase 13 deliverables without altering observable behaviour. Focus areas: workflow YAML correctness (correct job dependencies, matrix expansion, artifact names), binary artifact naming convention consistency across the release matrix, and editor configuration examples being accurate against the implemented config schema.

---

## Motivation

CI configuration errors and inconsistent artifact naming can silently break releases. Editor examples that diverge from the implemented schema mislead users.

- Motivated by: `Quality.CodeReview.PostPhase`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Post-phase code quality review of CI configuration and editor examples | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `.github/workflows/ci.yml` — verify job dependency graph and matrix correctness
- `.github/workflows/release.yml` — verify artifact naming convention consistency across all 4 targets
- `editors/neovim/flavor-grenade.lua` — verify settings keys against implemented config schema
- `editors/vscode/settings.json` — verify settings keys against implemented config schema
- `editors/helix/languages.toml` — verify language server entry against implemented config schema

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR008-oidc-publishing]] | Publishing workflow correctness is a code quality concern |

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
- [ ] Binary artifact naming follows `flavor-grenade-lsp-<target>[.exe]` convention consistently
- [ ] All editor config example settings keys verified against implemented config schema

---

## Notes

Run after CHORE-037 (Lint Sweep) is complete. If discrepancies between editor examples and the implemented config schema are found, update the examples — do not change the schema.

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
> Chore created. Status: `open`. Motivation: post-Phase-13 code quality sweep focusing on workflow YAML correctness, binary naming consistency, and editor config schema accuracy.
