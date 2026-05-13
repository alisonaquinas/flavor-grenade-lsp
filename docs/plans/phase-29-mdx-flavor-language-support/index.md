---
title: Phase 29 MDX Flavor Language Support Tickets
phase: 29
status: planned
tags: [plans/phase-29, tickets/index, mdx]
aliases: ["Phase 29 Tickets"]
updated: 2026-05-13
---

# Phase 29 MDX Flavor Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-055]] | MDX Flavor Language Support | Feature | `draft` |
| [[TASK-336]] | Implement MDX flavor parser semantics | Task | `open` |
| [[TASK-337]] | Add MDX diagnostics and LSP features | Task | `open` |
| [[TASK-338]] | Add MDX tests, host safety, and validation evidence | Task | `open` |
| [[CHORE-129]] | Phase 29 trace and documentation sweep | Chore | `open` |
| [[CHORE-130]] | Phase 29 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-336` covers JSX expression/component regions, ESM import/export awareness,
and Markdown/JSX boundaries for Markdown-language documents.

`TASK-337` wires diagnostics, semantic tokens, folding, and document symbols
without type-checking React components.

`TASK-338` proves `mdx` flavor does not overwrite a user-selected VS Code `mdx`
language mode.
