---
id: "CHORE-037"
title: "Phase 13 Lint Sweep"
type: chore
status: open
priority: medium
phase: 13
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/13"]
aliases: ["CHORE-037"]
---

# Phase 13 Lint Sweep

> [!INFO] `CHORE-037` · Chore · Phase 13 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run the full linter across all files introduced or modified in Phase 13, including the GitHub Actions workflow YAML files (`.github/workflows/ci.yml`, `.github/workflows/release.yml`), `package.json`, and any editor configuration examples. Resolve all lint warnings and ensure `bun run lint --max-warnings 0` exits 0 with no new suppressions added. This sweep explicitly includes linting of workflow YAML files.

---

## Motivation

Keeping lint clean after each feature phase prevents warning accumulation. Workflow YAML files are included because malformed YAML in CI configuration silently fails to parse and can disable CI without obvious error messages.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero lint warnings including workflow YAML files | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `.github/workflows/ci.yml` — lint and YAML validation fixes
- `.github/workflows/release.yml` — lint and YAML validation fixes
- `package.json` — lint fixes
- `editors/neovim/flavor-grenade.lua` — lint fixes
- `editors/vscode/settings.json` — JSON validation fixes
- `editors/helix/languages.toml` — TOML validation fixes

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR008-oidc-publishing]] | Workflow YAML must not introduce secret exposure patterns |

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
- [ ] Workflow YAML files validated (e.g., via `actionlint` or GitHub Actions schema validation)

---

## Notes

Run after all Phase 13 TASK tickets are in `done` state. Use `actionlint` or the GitHub Actions VS Code extension to validate workflow YAML syntax beyond basic YAML parsing.

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
> Chore created. Status: `open`. Motivation: post-Phase-13 lint sweep including workflow YAML files.
