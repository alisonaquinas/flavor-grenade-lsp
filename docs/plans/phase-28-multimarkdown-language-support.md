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
supported attributes, diagnostics, completions, document symbols, folding,
semantic tokens, and navigation for document-production constructs according to
[[docs/plans/markdown-flavor-lsp-applicability-matrix]].

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/multimarkdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `multimarkdown` enables MultiMarkdown-specific constructs.
- Shared table/footnote behavior is reused through profile capabilities.
- Integration and BDD coverage prove MultiMarkdown behavior.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-28-multimarkdown-language-support/index]]
