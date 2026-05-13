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
| [[docs/research/reddit-markdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[docs/requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[docs/gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[docs/test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[docs/test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[docs/test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[docs/test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[docs/test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `reddit` enables Reddit platform-awareness diagnostics.
- Host-only behavior is documented and not overclaimed.
- Integration and BDD coverage prove Reddit behavior.

## Related

- [[docs/adr/ADR020-markdown-flavor-selection]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[docs/plans/phase-33-reddit-markdown-language-support/index]]
