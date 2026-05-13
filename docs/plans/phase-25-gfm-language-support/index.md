---
title: Phase 25 GitHub Flavored Markdown Language Support Tickets
phase: 25
status: planned
tags: [plans/phase-25, tickets/index, gfm]
aliases: ["Phase 25 Tickets"]
updated: 2026-05-13
---

# Phase 25 GitHub Flavored Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| `FEAT-051` | GitHub Flavored Markdown Language Support | Feature | `draft` |
| `TASK-324` | Implement GFM parser semantics | Task | `open` |
| `TASK-325` | Add GFM diagnostics and LSP features | Task | `open` |
| `TASK-326` | Add GFM tests and validation evidence | Task | `open` |
| `CHORE-121` | Phase 25 trace and documentation sweep | Chore | `open` |
| `CHORE-122` | Phase 25 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-324` covers tables, task lists, strikethrough, autolinks, and GitHub-style
heading anchor behavior where local support is practical.

`TASK-325` wires diagnostics, completions, folding, semantic tokens, document
symbols, document links, and navigation for GFM constructs.

`TASK-326` adds unit, integration, BDD, and validation coverage for `gfm`.
