---
title: "Phase 27: Pandoc Markdown Language Support"
phase: 27
status: planned
tags: [plans, markdown-flavor, pandoc, language-support]
aliases: [Phase 27, Pandoc Markdown Support]
updated: 2026-05-13
---

# Phase 27: Pandoc Markdown Language Support

| Field | Value |
|---|---|
| Phase | 27 |
| Title | Pandoc Markdown Language Support |
| Status | planned |
| Gate | Practical local Pandoc Markdown constructs are implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement actual local language support for the `pandoc` flavor without running
Pandoc conversion.

## Scope

Support metadata blocks, citations, footnotes, math, attributes, fenced divs,
definition lists, labels, cross-references, diagnostics, completions, folding,
semantic tokens, document symbols, and navigation where practical.

## Acceptance

- Selecting `pandoc` enables Pandoc-specific syntax intelligence.
- Conversion-only behavior is documented as out of local LSP scope.
- Integration and BDD coverage prove Pandoc behavior.

## Tickets

Ticket index: [[plans/phase-27-pandoc-markdown-language-support/index]]
