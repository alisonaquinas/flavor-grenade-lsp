---
id: "TASK-011"
title: "Create .flavor-grenade.toml project config marker"
type: task
# status: in-review | red | green | refactor | in-review | done | blocked | cancelled
status: in-review
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-011"]
---

# Create .flavor-grenade.toml project config marker

> [!INFO] `TASK-011` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `.flavor-grenade.toml` at the project root. This file serves a dual purpose: it is the vault detection marker that identifies a directory tree as a flavor-grenade-lsp workspace, and it is the reference schema for LSP server configuration. At this phase the file contains default values for vault file extensions, completion candidate limits, wiki-link style, and diagnostic suppression. The configuration schema is the authoritative reference for the `[vault]`, `[lsp]`, and `[diagnostics]` sections that the LSP server will read at startup in later phases.

---

## Implementation Notes

- File: `.flavor-grenade.toml` (project root, dot-prefixed)
- Section `[vault]` — `extensions = [".md"]` sets the file types treated as markdown documents
- Section `[lsp]` — `completion.candidates = 50` and `linkStyle = "file-stem"` define default completion behaviour
- Section `[diagnostics]` — `suppress = []` means no diagnostics suppressed by default
- This file will be read by the vault discovery logic in Phase 4; the schema must not change without a corresponding ADR
- See also: [[adr/ADR001-stdio-transport]], [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Configuration marker; workspace detection requirements addressed in Phase 4 | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets the config marker file creation at this phase |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — configuration file; no code to test at this phase | — | N/A |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | `.flavor-grenade.toml` is the workspace detection marker; its presence in a directory root identifies an LSP-managed vault |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] — Project root must exist before config marker is placed.

**Unblocks:**

- Phase 4 vault discovery tasks that read this file to locate workspace roots.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `.flavor-grenade.toml` exists at project root
- [ ] Contains `[vault]` section with `extensions = [".md"]`
- [ ] Contains `[lsp]` section with `completion.candidates = 50` and `linkStyle = "file-stem"`
- [ ] Contains `[diagnostics]` section with `suppress = []`
- [ ] File is tracked in git (not excluded by `.gitignore`)
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

The dot prefix (`.flavor-grenade.toml`) follows the convention of hidden configuration files on Unix systems. On Windows, this file is visible normally. The LSP server must look for this exact filename when traversing workspace root candidates.

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
