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

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[research/multimarkdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `multimarkdown` enables MultiMarkdown-specific constructs.
- Shared table/footnote behavior is reused through profile capabilities.
- Integration and BDD coverage prove MultiMarkdown behavior.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[plans/phase-28-multimarkdown-language-support/index]]
