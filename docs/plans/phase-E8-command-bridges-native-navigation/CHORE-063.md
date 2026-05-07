---
id: "CHORE-063"
title: "Phase E8 Lint Sweep"
type: chore
status: in-review
priority: medium
phase: E8
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-185", "TASK-186", "TASK-187", "TASK-188"]
tags: [tickets/chore, "phase/E8"]
aliases: ["CHORE-063"]
---

# Phase E8 Lint Sweep

> [!INFO] `CHORE-063` - Chore - Phase E8 - Priority: `medium` - Status: `in-review`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process.

---

## Description

Run lint and formatting checks across files touched for Phase E8 command
bridges. Resolve warnings without adding suppressions and confirm bridge code,
tests, and docs remain clean.

---

## Motivation

Command bridge payload handling is a boundary surface, so lint cleanup should be
kept separate from behavior changes.

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | Phase E8 must introduce no lint warnings | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- Phase E8 implementation, test, and docs files - lint fixes only

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Keep command bridge client code explicit and validated |

---

## Dependencies

**Blocked by:**

- [[TASK-185]] - native reference and link bridges should be complete
- [[TASK-186]] - payload validation should be complete
- [[TASK-187]] - graph action bridges should be complete
- [[TASK-188]] - command docs should be complete

**Unblocks:**

- [[CHORE-064]] - test trace sweep should run after lint fixes settle paths

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [x] Markdown lint passes for Phase E8 docs
- [x] No new lint suppressions are added
- [x] No behavior-affecting changes beyond lint fixes

---

## Notes

Run after Phase E8 task tickets are in `done` or `in-review`.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: post-Phase-E8 lint sweep.

> [!INFO] In Review - 2026-05-07
> Lint and quality sweep passed locally: extension typecheck/test/build,
> repo lint/typecheck/build/test, root format check, docs markdown lint,
> non-doc markdown lint, and extension npm audit.
