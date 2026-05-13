---
title: "Phase 33: Reddit Markdown Language Support"
phase: 33
status: planned
tags: [plans, markdown-flavor, reddit, language-support]
aliases: [Phase 33, Reddit Markdown Support]
updated: 2026-05-13
---

# Phase 33: Reddit Markdown Language Support

| Field | Value |
|---|---|
| Phase | 33 |
| Title | Reddit Markdown Language Support |
| Status | planned |
| Gate | Reddit Markdown host-specific syntax awareness is implemented and tested |
| Depends on | Phase 23 |

## Objective

Implement practical local language support for the `reddit` flavor with clear
boundaries between Markdown syntax and Reddit host rendering.

## Scope

Support Reddit-specific portability diagnostics, escaping behavior, spoiler and
host-specific constructs where documented, line-break behavior, syntax warnings,
semantic tokens, folding, and completion or quick-fix guidance where useful.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[research/reddit-markdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `reddit` enables Reddit platform-awareness diagnostics.
- Host-only behavior is documented and not overclaimed.
- Integration and BDD coverage prove Reddit behavior.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[plans/phase-33-reddit-markdown-language-support/index]]
