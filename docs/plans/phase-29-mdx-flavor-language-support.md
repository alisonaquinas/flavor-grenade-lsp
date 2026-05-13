---
title: "Phase 29: MDX Flavor Language Support"
phase: 29
status: planned
tags: [plans, markdown-flavor, mdx, language-support]
aliases: [Phase 29, MDX Flavor Support]
updated: 2026-05-13
---

# Phase 29: MDX Flavor Language Support

| Field | Value |
|---|---|
| Phase | 29 |
| Title | MDX Flavor Language Support |
| Status | planned |
| Gate | MDX flavor syntax is supported without taking over VS Code MDX language mode |
| Depends on | Phase 23, Phase E15 |

## Objective

Implement practical local language support for `mdx` as a Markdown flavor while
preserving manual VS Code `mdx` language-mode choices.

## Scope

Support JSX expression/component region detection, ESM import/export awareness,
Markdown/JSX boundary handling, diagnostics for malformed boundaries,
semantic-token boundaries, folding, and document symbols where practical.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/mdx-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `mdx` as a flavor only applies to documents whose VS Code language
  remains `markdown`.
- Manual `mdx` language documents are preserved and not overwritten.
- Integration, host, and BDD coverage prove the distinction.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-29-mdx-flavor-language-support/index]]
