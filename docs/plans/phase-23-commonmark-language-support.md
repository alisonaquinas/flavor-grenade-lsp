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
semantic tokens, completion, diagnostics, and navigation where applicable.

## Acceptance

- Generic Markdown in `auto` resolves to CommonMark and gets CommonMark
  behavior.
- GFM tables/tasks and Obsidian wiki links are not treated as CommonMark core.
- Spawned-server and BDD coverage prove behavior under `commonmark`.

## Tickets

Ticket index: [[plans/phase-23-commonmark-language-support/index]]
