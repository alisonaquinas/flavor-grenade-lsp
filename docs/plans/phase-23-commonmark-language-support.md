---
title: "Phase 23: CommonMark Language Support"
phase: 23
status: planned
tags: [plans, markdown-flavor, commonmark, language-support]
aliases: [Phase 23, CommonMark Support]
updated: 2026-05-13
---

# Phase 23: CommonMark Language Support

| Field | Value |
|---|---|
| Phase | 23 |
| Title | CommonMark Language Support |
| Status | planned |
| Gate | CommonMark behavior is implemented and tested |
| Depends on | Phase 22 |

## Objective

Implement actual language support for the `commonmark` flavor using
standardized CommonMark semantics and explicit exclusions for GFM and Obsidian
extensions.

## Scope

Support fenced code, ATX/setext headings, reference links, autolinks, normalized
labels, HTML blocks, blockquote/list edge cases, document links, folding,
semantic tokens, completion, diagnostics, and navigation according to
[[docs/plans/markdown-flavor-lsp-applicability-matrix]].

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/commonmark-and-original-markdown]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Generic Markdown in `auto` resolves to CommonMark and gets CommonMark
  behavior.
- GFM tables/tasks and Obsidian wiki links are not treated as CommonMark core.
- Spawned-server and BDD coverage prove behavior under `commonmark`.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-23-commonmark-language-support/index]]
