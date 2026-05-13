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

## Acceptance

- Selecting `gfm` enables GFM constructs that CommonMark does not.
- Unsupported GitHub platform behavior is documented or diagnosed honestly.
- Integration and BDD coverage prove GFM behavior.

## Tickets

Ticket index: [[plans/phase-25-gfm-language-support/index]]
