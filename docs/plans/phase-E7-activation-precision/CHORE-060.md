---
id: "CHORE-060"
title: "Phase E7 Lint Sweep"
type: chore
status: done
priority: medium
phase: E7
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-181", "TASK-182", "TASK-183", "TASK-184"]
tags: [tickets/chore, "phase/E7"]
aliases: ["CHORE-060"]
---

# Phase E7 Lint Sweep

> [!INFO] `CHORE-060` - Chore - Phase E7 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process.

---

## Description

Run lint and formatting checks across files touched for Phase E7 activation
precision. Resolve warnings without adding suppressions and confirm the phase
leaves extension and docs changes clean.

---

## Motivation

Activation changes touch extension startup paths, where small cleanup issues can
hide real regressions.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase E7 must introduce no lint warnings | [[docs/requirements/technical/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase E7 implementation, test, and docs files - lint fixes only

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Keep client changes focused and explicit |

---

## Dependencies

**Blocked by:**

- [[TASK-181]] - marker activation events should be complete
- [[TASK-182]] - startup gating should be complete
- [[TASK-183]] - wake path coverage should be complete
- [[TASK-184]] - activation docs should be complete

**Unblocks:**

- [[CHORE-061]] - test trace sweep should run after lint fixes settle paths

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] Markdown lint passes for Phase E7 docs
- [x] No new lint suppressions are added
- [x] No behavior-affecting changes beyond lint fixes

---

## Notes

Run after Phase E7 task tickets are in `done` or `in-review`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: post-Phase-E7 lint sweep.

> [!INFO] In Review - 2026-05-07
> Lint and quality sweep passed locally: extension typecheck/test/build,
> repo lint/typecheck/build/test, root format check, docs markdown lint,
> non-doc markdown lint, and extension npm audit.

> [!SUCCESS] Done - 2026-05-07
> PR #39 CI passed; lint sweep is complete.
