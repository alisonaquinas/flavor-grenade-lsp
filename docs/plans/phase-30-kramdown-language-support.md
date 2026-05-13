---
title: "Phase 30: kramdown Language Support"
phase: 30
status: planned
tags: [plans, markdown-flavor, kramdown, language-support]
aliases: [Phase 30, kramdown Support]
updated: 2026-05-13
---

# Phase 30: kramdown Language Support

| Field | Value |
|---|---|
| Phase | 30 |
| Title | kramdown Language Support |
| Status | planned |
| Gate | kramdown-specific constructs are implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement actual language support for the `kramdown` flavor.

## Scope

Support block and span attributes, definition lists, tables, math, footnotes,
IAL behavior, diagnostics, completions, document symbols, folding, semantic
tokens, and navigation for locally meaningful constructs.

## Acceptance

- Selecting `kramdown` enables kramdown attribute and block syntax.
- Shared constructs are capability-gated against other flavors.
- Integration and BDD coverage prove kramdown behavior.

## Tickets

Ticket index: [[plans/phase-30-kramdown-language-support/index]]
