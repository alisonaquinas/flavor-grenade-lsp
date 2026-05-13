---
title: "Phase 32: R Markdown Language Support"
phase: 32
status: planned
tags: [plans, markdown-flavor, r-markdown, language-support]
aliases: [Phase 32, R Markdown Support]
updated: 2026-05-13
---

# Phase 32: R Markdown Language Support

| Field | Value |
|---|---|
| Phase | 32 |
| Title | R Markdown Language Support |
| Status | planned |
| Gate | R Markdown metadata and chunk syntax are implemented without execution |
| Depends on | Phase 23 |

## Objective

Implement practical local language support for the `r-markdown` flavor without
executing code.

## Scope

Support YAML metadata, executable chunk fences, chunk labels/options, inline
code markers where practical, diagnostics for malformed chunk headers, folding,
document symbols, semantic tokens, and completion for chunk options.

## Acceptance

- Selecting `r-markdown` enables R Markdown metadata and chunk intelligence.
- No R, Python, shell, or notebook code is executed.
- Integration and BDD coverage prove R Markdown behavior.

## Tickets

Ticket index: [[plans/phase-32-r-markdown-language-support/index]]
