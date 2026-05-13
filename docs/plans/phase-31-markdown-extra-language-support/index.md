---
title: Phase 31 Markdown Extra Language Support Tickets
phase: 31
status: in-progress
tags: [plans/phase-31, tickets/index, markdown-extra]
aliases: ["Phase 31 Tickets"]
updated: 2026-05-13
---

# Phase 31 Markdown Extra Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-057]] | Markdown Extra Language Support | Feature | `in-progress` |
| [[TASK-342]] | Implement Markdown Extra parser semantics | Task | `open` |
| [[TASK-343]] | Add Markdown Extra diagnostics and LSP features | Task | `open` |
| [[TASK-344]] | Add Markdown Extra tests and validation evidence | Task | `open` |
| [[CHORE-133]] | Phase 31 trace and documentation sweep | Chore | `open` |
| [[CHORE-134]] | Phase 31 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-342` covers tables, definition lists, footnotes, abbreviations, fenced
code, and attribute blocks.

`TASK-343` wires diagnostics, completions, document symbols, folding, semantic
tokens, and navigation.

`TASK-344` adds unit coverage via
[[docs/test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]]
plus integration, BDD, and validation coverage for `markdown-extra`.
