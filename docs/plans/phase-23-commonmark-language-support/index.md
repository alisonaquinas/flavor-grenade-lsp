---
title: Phase 23 CommonMark Language Support Tickets
phase: 23
status: planned
tags: [plans/phase-23, tickets/index, commonmark]
aliases: ["Phase 23 Tickets"]
updated: 2026-05-13
---

# Phase 23 CommonMark Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-049]] | CommonMark Language Support | Feature | `draft` |
| [[TASK-318]] | Implement CommonMark parser semantics | Task | `open` |
| [[TASK-319]] | Add CommonMark diagnostics and LSP features | Task | `open` |
| [[TASK-320]] | Add CommonMark tests and validation evidence | Task | `open` |
| [[CHORE-117]] | Phase 23 trace and documentation sweep | Chore | `open` |
| [[CHORE-118]] | Phase 23 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-318` covers fenced code, setext/ATX headings, reference labels, autolinks,
HTML blocks, list/blockquote edge cases, and normalized labels.

`TASK-319` wires diagnostics, completions, document links, folding, semantic
tokens, and navigation while keeping GFM and Obsidian extensions gated.

`TASK-320` adds unit, integration, BDD, and validation coverage for
`commonmark`, including generic Markdown `auto` fallback.
