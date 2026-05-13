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

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[research/pandoc-markdown-deep-research-report]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `pandoc` enables Pandoc-specific syntax intelligence.
- Conversion-only behavior is documented as out of local LSP scope.
- Integration and BDD coverage prove Pandoc behavior.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[plans/phase-27-pandoc-markdown-language-support/index]]
