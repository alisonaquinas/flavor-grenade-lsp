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

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/kramdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `kramdown` enables kramdown attribute and block syntax.
- Shared constructs are capability-gated against other flavors.
- Integration and BDD coverage prove kramdown behavior.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-30-kramdown-language-support/index]]
