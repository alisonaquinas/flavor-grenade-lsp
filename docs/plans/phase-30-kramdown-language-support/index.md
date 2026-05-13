---
title: Phase 30 kramdown Language Support Tickets
phase: 30
status: planned
tags: [plans/phase-30, tickets/index, kramdown]
aliases: ["Phase 30 Tickets"]
updated: 2026-05-13
---

# Phase 30 kramdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-056]] | kramdown Language Support | Feature | `draft` |
| [[TASK-339]] | Implement kramdown parser semantics | Task | `open` |
| [[TASK-340]] | Add kramdown diagnostics and LSP features | Task | `open` |
| [[TASK-341]] | Add kramdown tests and validation evidence | Task | `open` |
| [[CHORE-131]] | Phase 30 trace and documentation sweep | Chore | `open` |
| [[CHORE-132]] | Phase 30 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-339` covers block/span attributes, definition lists, tables, math,
footnotes, and IAL behavior.

`TASK-340` wires diagnostics, completions, document symbols, folding, semantic
tokens, and navigation.

`TASK-341` adds unit coverage via
[[test/markdown-flavor-unit-spec#MF-U-018 - kramdown Parser And Analysis|MF-U-018]]
plus integration, BDD, and validation coverage for `kramdown`.
