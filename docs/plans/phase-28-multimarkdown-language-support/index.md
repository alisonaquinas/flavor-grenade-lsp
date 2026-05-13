---
title: Phase 28 MultiMarkdown Language Support Tickets
phase: 28
status: in-progress
tags: [plans/phase-28, tickets/index, multimarkdown]
aliases: ["Phase 28 Tickets"]
updated: 2026-05-13
---

# Phase 28 MultiMarkdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-054]] | MultiMarkdown Language Support | Feature | `in-progress` |
| [[TASK-333]] | Implement MultiMarkdown parser semantics | Task | `green` |
| [[TASK-334]] | Add MultiMarkdown diagnostics and LSP features | Task | `green` |
| [[TASK-335]] | Add MultiMarkdown tests and validation evidence | Task | `green` |
| [[CHORE-127]] | Phase 28 trace and documentation sweep | Chore | `open` |
| [[CHORE-128]] | Phase 28 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-333` covers metadata, tables, footnotes, citations, cross-references,
labels, and document-production syntax.

`TASK-334` wires diagnostics, completions, document symbols, folding, semantic
tokens, and navigation.

`TASK-335` adds unit coverage via
[[docs/test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]]
plus integration, BDD, and validation coverage for `multimarkdown`.
