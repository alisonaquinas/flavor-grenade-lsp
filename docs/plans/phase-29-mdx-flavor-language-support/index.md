---
title: Phase 29 MDX Flavor Language Support Tickets
phase: 29
status: in-progress
tags: [plans/phase-29, tickets/index, mdx]
aliases: ["Phase 29 Tickets"]
updated: 2026-05-13
---

# Phase 29 MDX Flavor Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-055]] | MDX Flavor Language Support | Feature | `in-progress` |
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

Unit coverage traces to
[[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]].

## Deferred Follow-Up Notes

React or TypeScript symbol lookup for JSX components, imports, and expressions
is out of scope for Phase 29. Any later cross-language symbol resolution must be
opened as a separate platform- or language-service integration ticket; Phase 29
remains responsible for local Markdown/MDX boundary support and VS Code
language-mode safety.
