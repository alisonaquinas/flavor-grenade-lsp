---
title: "Phase 22: Original Markdown Language Support"
phase: 22
status: planned
tags: [plans, markdown-flavor, original-markdown, language-support]
aliases: [Phase 22, Original Markdown Support]
updated: 2026-05-13
---

# Phase 22: Original Markdown Language Support

| Field | Value |
|---|---|
| Phase | 22 |
| Title | Original Markdown Language Support |
| Status | planned |
| Gate | Historical Original Markdown behavior is implemented and tested |
| Depends on | Phase 21 |

## Objective

Implement actual language support for the `original` flavor: historical core
Markdown constructs, deliberate exclusion of later extensions, and LSP behavior
that does not accidentally enable CommonMark, GFM, or Obsidian features.

## Scope

Support headings, paragraphs, blockquotes, lists, indented code, inline links,
images, emphasis, and raw HTML boundaries. Treat fenced code, pipe tables, task
lists, wiki links, and callouts as non-core constructs.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[research/commonmark-and-original-markdown]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Original Markdown parsing affects diagnostics, completions, document links,
  folding, semantic tokens, and navigation.
- Unsupported extensions are ignored or reported as portability issues according
  to the profile.
- Spawned-server and BDD coverage prove behavior under `original`.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[plans/phase-22-original-markdown-language-support/index]]
