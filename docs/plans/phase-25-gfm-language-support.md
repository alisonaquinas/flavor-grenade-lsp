---
title: "Phase 25: GitHub Flavored Markdown Language Support"
phase: 25
status: planned
tags: [plans, markdown-flavor, gfm, language-support]
aliases: [Phase 25, GFM Support]
updated: 2026-05-13
---

# Phase 25: GitHub Flavored Markdown Language Support

| Field | Value |
|---|---|
| Phase | 25 |
| Title | GitHub Flavored Markdown Language Support |
| Status | planned |
| Gate | GFM signature constructs are implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement actual language support for the `gfm` flavor on top of CommonMark.

## Scope

Support GFM pipe tables, task lists, strikethrough, autolinks, GitHub-style
heading anchors where appropriate, diagnostics, completions, document symbols,
folding, semantic tokens, and navigation for implemented constructs.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[docs/research/github-flavored-markdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `gfm` enables GFM constructs that CommonMark does not.
- Unsupported GitHub platform behavior is documented or diagnosed honestly.
- Integration and BDD coverage prove GFM behavior.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-25-gfm-language-support/index]]
