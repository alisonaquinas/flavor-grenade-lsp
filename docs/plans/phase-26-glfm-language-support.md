---
title: "Phase 26: GitLab Flavored Markdown Language Support"
phase: 26
status: planned
tags: [plans, markdown-flavor, glfm, language-support]
aliases: [Phase 26, GLFM Support]
updated: 2026-05-13
---

# Phase 26: GitLab Flavored Markdown Language Support

| Field | Value |
|---|---|
| Phase | 26 |
| Title | GitLab Flavored Markdown Language Support |
| Status | planned |
| Gate | GLFM signature constructs are implemented and tested |
| Depends on | Phase 25 |

## Objective

Implement actual language support for the `glfm` flavor, including the local
syntax portions of GitLab Flavored Markdown that can be modeled without GitLab
service access.

## Scope

Support the GLFM/CommonMark/GFM baseline, GitLab references, media and heading
conventions, local diagnostics, completions, semantic tokens, document links,
and navigation where the behavior is offline-testable.

## Requirement Trace

| Source | Phase responsibility |
|---|---|
| [[research/gitlab-flavored-markdown-analysis]] | Define flavor-specific syntax, platform boundaries, and portability behavior |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.DialectProfiles]] | Provide a documented source-backed dialect profile |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Ensure selected flavor affects server analysis |
| [[gaps/markdown-flavor-gap-analysis]] | Close server-side language-support gaps |
| [[test/markdown-flavor-unit-spec]] | Cover profile and parser behavior |
| [[test/markdown-flavor-integration-spec]] | Cover spawned-server flavor behavior |
| [[test/markdown-flavor-e2e-spec]] | Cover BDD user-visible behavior |
| [[test/markdown-flavor-verification-spec]] | Cover CI and command verification |
| [[test/markdown-flavor-validation-spec]] | Cover research-to-profile validation |

## Acceptance

- Selecting `glfm` enables GitLab-specific syntax awareness.
- Host-only GitLab behavior is separated from local LSP behavior.
- Integration and BDD coverage prove GLFM behavior.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[features/ofmarkdown-language-mode]]
- [[gaps/markdown-flavor-gap-analysis]]

## Tickets

Ticket index: [[plans/phase-26-glfm-language-support/index]]
