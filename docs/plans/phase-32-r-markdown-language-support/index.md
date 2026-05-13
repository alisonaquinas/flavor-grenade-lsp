---
title: Phase 32 R Markdown Language Support Tickets
phase: 32
status: planned
tags: [plans/phase-32, tickets/index, r-markdown]
aliases: ["Phase 32 Tickets"]
updated: 2026-05-13
---

# Phase 32 R Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-058]] | R Markdown Language Support | Feature | `draft` |
| [[TASK-345]] | Implement R Markdown parser semantics | Task | `open` |
| [[TASK-346]] | Add R Markdown diagnostics and LSP features | Task | `open` |
| [[TASK-347]] | Add R Markdown tests and validation evidence | Task | `open` |
| [[CHORE-135]] | Phase 32 trace and documentation sweep | Chore | `open` |
| [[CHORE-136]] | Phase 32 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-345` covers YAML metadata, fenced executable chunk detection, chunk
labels/options, and inline code markers where practical.

`TASK-346` wires diagnostics, completions for chunk options, folding, semantic
tokens, and document symbols without executing code.

`TASK-347` adds unit, integration, BDD, and validation coverage for
`r-markdown`.
