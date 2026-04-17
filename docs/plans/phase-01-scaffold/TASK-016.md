---
id: "TASK-016"
title: "Create .gitignore"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-016"]
---

# Create .gitignore

> [!INFO] `TASK-016` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `.gitignore` at the project root to exclude build artefacts, runtime-generated files, and local environment data from version control. The entries required are: `node_modules/` (package installations managed by Bun), `dist/` (TypeScript compiled output), `.env` (local environment variables — must never be committed), `*.log` (all log files), `reports/` (test and coverage reports), `coverage/` (Bun coverage output), and `.bun/` (Bun's local cache directory). This file must be committed before any `bun install` is run to prevent accidental inclusion of `node_modules`.

---

## Implementation Notes

- File: `.gitignore` (project root)
- Required entries: `node_modules/`, `dist/`, `.env`, `*.log`, `reports/`, `coverage/`, `.bun/`
- Verify that `.flavor-grenade.toml` is NOT in `.gitignore` — it must be tracked
- Verify that `bunfig.toml` is NOT in `.gitignore` — it must be tracked
- Verify that `eslint.config.js` and `.prettierrc.json` are NOT in `.gitignore`
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Repository hygiene; no functional requirement tag yet assigned | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets `.gitignore` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — configuration file; no code to test | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Build output (`dist/`) excluded from git; only source files are version-controlled |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — Project root must exist.

**Unblocks:**

- All subsequent tasks — a correct `.gitignore` prevents accidental commits of generated files.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `.gitignore` exists at project root
- [ ] Contains `node_modules/`, `dist/`, `.env`, `*.log`, `reports/`, `coverage/`, `.bun/`
- [ ] `git status` does not show `node_modules/` as untracked after `bun install`
- [ ] `git status` does not show `dist/` as untracked after `bun run build`
- [ ] `.flavor-grenade.toml`, `bunfig.toml`, `eslint.config.js`, `.prettierrc.json` are NOT ignored
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

The `.env` entry (without a trailing slash) ignores `.env` files at any depth. If environment-specific config files are needed in the future, use `.env.example` as a committed template and `.env` as the local override, never committed.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-002]].

> [!INFO] In-review — 2026-04-17
> Implementation complete. Gate command `bun run gate:1` passed. Status: `in-review`.
