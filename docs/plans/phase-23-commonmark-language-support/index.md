---
title: Phase 23 CommonMark Language Support Tickets
phase: 23
status: in-progress
tags: [plans/phase-23, tickets/index, commonmark]
aliases: ["Phase 23 Tickets"]
updated: 2026-05-13
---

# Phase 23 CommonMark Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-049]] | CommonMark Language Support | Feature | `in-progress` |
| [[TASK-318]] | Implement CommonMark parser semantics | Task | `green` |
| [[TASK-319]] | Add CommonMark diagnostics and LSP features | Task | `green` |
| [[TASK-320]] | Add CommonMark tests and validation evidence | Task | `green` |
| [[CHORE-117]] | Phase 23 trace and documentation sweep | Chore | `green` |
| [[CHORE-118]] | Phase 23 verification and closeout sweep | Chore | `green` |
| [[BUG-046]] | Stabilize file watcher completion BDD scenario | Bug | `done` |

## Ticket Details

`TASK-318` covers fenced code, setext/ATX headings, reference labels, autolinks,
HTML blocks, list/blockquote edge cases, and normalized labels.

`TASK-319` wires diagnostics, completions, document links, folding, semantic
tokens, and navigation while keeping GFM and Obsidian extensions gated.

`TASK-320` adds unit, integration, BDD, and validation coverage for
`commonmark`, including generic Markdown `auto` fallback.
