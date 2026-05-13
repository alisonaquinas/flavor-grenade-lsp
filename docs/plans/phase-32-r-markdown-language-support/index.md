---
title: Phase 32 R Markdown Language Support Tickets
phase: 32
status: in-progress
tags: [plans/phase-32, tickets/index, r-markdown]
aliases: ["Phase 32 Tickets"]
updated: 2026-05-13
---

# Phase 32 R Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-058]] | R Markdown Language Support | Feature | `in-progress` |
| [[TASK-345]] | Implement R Markdown parser semantics | Task | `green` |
| [[TASK-346]] | Add R Markdown diagnostics and LSP features | Task | `green` |
| [[TASK-347]] | Add R Markdown tests and validation evidence | Task | `green` |
| [[CHORE-135]] | Phase 32 trace and documentation sweep | Chore | `open` |
| [[CHORE-136]] | Phase 32 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-345` covers YAML metadata, fenced executable chunk detection, chunk
labels/options, and inline code markers where practical.

`TASK-346` wires diagnostics, completions for chunk options, folding, semantic
tokens, and document symbols without executing code.

`TASK-347` adds unit coverage via
[[docs/test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]]
plus integration, BDD, and validation coverage for `r-markdown`.
