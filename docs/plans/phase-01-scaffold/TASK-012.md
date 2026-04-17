---
id: "TASK-012"
title: "Configure ESLint"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-005"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-012"]
---

# Configure ESLint

> [!INFO] `TASK-012` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `eslint.config.js` at the project root using ESLint's flat config format (ESLint v9+). The configuration targets all `src/**/*.ts` files, uses `@typescript-eslint/parser` as the language parser, and enables `@typescript-eslint/eslint-plugin` rules. The two non-default rules enforced are: `@typescript-eslint/no-explicit-any` set to `error` (prohibiting `any` type usage), and `@typescript-eslint/explicit-function-return-type` set to `warn` (requiring return types on all functions). This configuration enforces the zero-`any` and explicit-types invariants required by the architecture.

---

## Implementation Notes

- File: `eslint.config.js` (flat config format — ESLint v9+ default)
- Import `tseslint` from `@typescript-eslint/eslint-plugin` and `tsparser` from `@typescript-eslint/parser`
- Use `export default [{ files: ['src/**/*.ts'], languageOptions: { parser: tsparser }, ... }]`
- Include `...tseslint.configs.recommended.rules` to enable all recommended TypeScript rules
- Add `'@typescript-eslint/no-explicit-any': 'error'` and `'@typescript-eslint/explicit-function-return-type': 'warn'`
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Linting configuration; zero-warnings quality requirement addressed by CHORE-001 | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets ESLint configuration |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — pure configuration file; no test | — | N/A — verified by `bun run lint` exiting 0 after CHORE-001 |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | `no-explicit-any` enforced at `error` level — LSP handler types must use strict LSP protocol types, not `any` |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-005]] — ESLint and `@typescript-eslint` packages must be installed.

**Unblocks:**

- [[tickets/CHORE-001]] — Lint sweep depends on ESLint being configured.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `eslint.config.js` exists at project root
- [ ] Uses flat config format (array export)
- [ ] Targets `src/**/*.ts` files with TypeScript parser
- [ ] Includes `@typescript-eslint/no-explicit-any: 'error'`
- [ ] Includes `@typescript-eslint/explicit-function-return-type: 'warn'`
- [ ] `bun run lint` runs without crashing (warnings/errors from skeleton code resolved in CHORE-001)
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

ESLint v9 uses flat config (`eslint.config.js`) by default. The older `.eslintrc.*` format is deprecated. If the installed ESLint version is v8 or below, a `--config eslint.config.js` flag may be needed until the flat config migration is complete.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-002]].
