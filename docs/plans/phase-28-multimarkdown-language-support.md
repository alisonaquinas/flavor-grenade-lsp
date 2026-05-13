---
title: "Phase 28: MultiMarkdown Language Support"
phase: 28
status: planned
tags: [plans, markdown-flavor, multimarkdown, language-support]
aliases: [Phase 28, MultiMarkdown Support]
updated: 2026-05-13
---

# Phase 28: MultiMarkdown Language Support

| Field | Value |
|---|---|
| Phase | 28 |
| Title | MultiMarkdown Language Support |
| Status | planned |
| Gate | MultiMarkdown document-production constructs are implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement actual language support for the `multimarkdown` flavor.

## Scope

Support metadata, tables, footnotes, citations, cross-references, labels,
attributes where applicable, diagnostics, completions, document symbols,
folding, semantic tokens, and navigation for document-production constructs.

## Acceptance

- Selecting `multimarkdown` enables MultiMarkdown-specific constructs.
- Shared table/footnote behavior is reused through profile capabilities.
- Integration and BDD coverage prove MultiMarkdown behavior.

## Tickets

Ticket index: [[plans/phase-28-multimarkdown-language-support/index]]
