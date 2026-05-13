---
title: "Phase 31: Markdown Extra Language Support"
phase: 31
status: planned
tags: [plans, markdown-flavor, markdown-extra, language-support]
aliases: [Phase 31, Markdown Extra Support]
updated: 2026-05-13
---

# Phase 31: Markdown Extra Language Support

| Field | Value |
|---|---|
| Phase | 31 |
| Title | Markdown Extra Language Support |
| Status | planned |
| Gate | Markdown Extra constructs are implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement actual language support for the `markdown-extra` flavor.

## Scope

Support pipe tables, definition lists, footnotes, abbreviations, fenced code,
attribute blocks, diagnostics, completions, document symbols, folding, semantic
tokens, and navigation where applicable.

## Acceptance

- Selecting `markdown-extra` enables Markdown Extra constructs.
- Constructs shared with kramdown or MultiMarkdown are capability-gated.
- Integration and BDD coverage prove Markdown Extra behavior.

## Tickets

Ticket index: [[plans/phase-31-markdown-extra-language-support/index]]
