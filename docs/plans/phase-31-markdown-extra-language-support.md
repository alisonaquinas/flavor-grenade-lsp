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
tokens, and navigation according to
[[plans/markdown-flavor-lsp-applicability-matrix]].

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[research/markdown-extra-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `markdown-extra` enables Markdown Extra constructs.
- Constructs shared with kramdown or MultiMarkdown are capability-gated.
- Integration and BDD coverage prove Markdown Extra behavior.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[plans/phase-31-markdown-extra-language-support/index]]
