---
id: "CHORE-047"
title: "Phase 15 Lint Sweep"
type: chore
status: done
priority: medium
phase: 15
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-168"]
tags: [tickets/chore, "phase/15"]
aliases: ["CHORE-047"]
---

# Phase 15 Lint Sweep

> [!INFO] `CHORE-047` · Chore · Phase 15 · Priority: `medium` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Run the full linter across files introduced or modified for Phase 15 attachment
intelligence. Resolve lint warnings, formatting drift, and stale suppressions so
`bun run lint --max-warnings 0` exits 0 after the attachment index, providers,
and configuration polish land.

---

## Motivation

Keeping lint clean after the attachment phase prevents warning accumulation in
shared vault, completion, diagnostics, navigation, hover, and config modules.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero lint warnings for Phase 15 changes | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/vault/**` — lint fixes for attachment indexing code.
- `src/completion/**` — lint fixes for attachment completion code.
- `src/resolution/**` — lint fixes for attachment diagnostics or resolution.
- `src/handlers/**` — lint fixes for definition and hover handlers.
- `src/lsp/**` — lint fixes for config or LSP integration.

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| — | None |

---

## Dependencies

**Blocked by:**

- [[TASK-168]] — lint sweep should run after final Phase 15 implementation.

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [ ] `tsc --noEmit` exits 0.
- [ ] `bun test` passes with no regressions introduced.
- [ ] No behaviour-affecting changes in `src/`; convert to TASK if needed.
- [ ] [[test/matrix]] updated if any test files were added or removed.
- [ ] [[test/index]] updated if any test files were added or removed.
- [ ] Phase 15 files have no markdownlint issues introduced by ticket updates.

---

## Notes

Run after [[TASK-168]] so final config-related imports, branches, and tests are
included in one cleanup pass.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-15 lint sweep.

> [!SUCCESS] Done - 2026-05-06
> Ran `bun run lint -- --max-warnings 0`, `bun run typecheck`, and `bun test`;
> all passed. `bun run bdd` runs as `bun run bdd` in this repo and reports
> pre-existing pending/undefined scenarios plus an unrelated block-anchor BDD
> fixture mismatch. No source changes were needed for lint cleanup.
> Status: `done`.
