---
title: Phase 27 Pandoc Markdown Language Support Tickets
phase: 27
status: planned
tags: [plans/phase-27, tickets/index, pandoc]
aliases: ["Phase 27 Tickets"]
updated: 2026-05-13
---

# Phase 27 Pandoc Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| `FEAT-053` | Pandoc Markdown Language Support | Feature | `draft` |
| `TASK-330` | Implement Pandoc Markdown parser semantics | Task | `open` |
| `TASK-331` | Add Pandoc diagnostics and LSP features | Task | `open` |
| `TASK-332` | Add Pandoc tests and validation evidence | Task | `open` |
| `CHORE-125` | Phase 27 trace and documentation sweep | Chore | `open` |
| `CHORE-126` | Phase 27 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-330` covers metadata blocks, citations, footnotes, math, attributes,
fenced divs, definition lists, labels, and cross-references.

`TASK-331` wires diagnostics, completions, folding, semantic tokens, document
symbols, and navigation without running Pandoc conversion.

`TASK-332` adds unit, integration, BDD, and validation coverage for `pandoc`.
