---
title: Phase 27 Pandoc Markdown Language Support Tickets
phase: 27
status: done
tags: [plans/phase-27, tickets/index, pandoc]
aliases: ["Phase 27 Tickets"]
updated: 2026-05-13
---

# Phase 27 Pandoc Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-053]] | Pandoc Markdown Language Support | Feature | `done` |
| [[TASK-330]] | Implement Pandoc Markdown parser semantics | Task | `done` |
| [[TASK-331]] | Add Pandoc diagnostics and LSP features | Task | `done` |
| [[TASK-332]] | Add Pandoc tests and validation evidence | Task | `done` |
| [[CHORE-125]] | Phase 27 trace and documentation sweep | Chore | `done` |
| [[CHORE-126]] | Phase 27 verification and closeout sweep | Chore | `done` |

## Ticket Details

`TASK-330` covers metadata blocks, citations, footnotes, math, attributes,
fenced divs, definition lists, labels, and cross-references.

`TASK-331` wires diagnostics, completions, folding, semantic tokens, document
symbols, and navigation without running Pandoc conversion.

`TASK-332` adds unit coverage via
[[docs/test/markdown-flavor-unit-spec#MF-U-015 - Pandoc Markdown Parser And Analysis|MF-U-015]]
plus integration, BDD, and validation coverage for `pandoc`.

## Deferred Follow-Up Notes

Pandoc conversion, citeproc processing, filters, templates, output writers, and
unconfigured bibliography database lookup are out of scope for Phase 27. Any
later integration must be opened as a separate conversion or bibliography
ticket; Phase 27 remains responsible for local Pandoc Markdown syntax,
reference-shape recognition, and portability diagnostics.
