---
title: Phase 22 Original Markdown Language Support Tickets
phase: 22
status: in-progress
tags: [plans/phase-22, tickets/index, original-markdown]
aliases: ["Phase 22 Tickets"]
updated: 2026-05-13
---

# Phase 22 Original Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-048]] | Original Markdown Language Support | Feature | `in-progress` |
| [[TASK-315]] | Implement Original Markdown parser semantics | Task | `in-progress` |
| [[TASK-316]] | Add Original Markdown diagnostics and LSP features | Task | `in-progress` |
| [[TASK-317]] | Add Original Markdown tests and validation evidence | Task | `in-progress` |
| [[CHORE-115]] | Phase 22 trace and documentation sweep | Chore | `open` |
| [[CHORE-116]] | Phase 22 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-315` covers historical baseline constructs: headings, lists, blockquotes,
indented code, links, images, emphasis, and HTML boundaries.

`TASK-316` wires diagnostics, completion, document links, folding, semantic
tokens, and navigation while rejecting later extensions as core syntax.

`TASK-317` adds unit, integration, BDD, and validation coverage for the
`original` flavor.
