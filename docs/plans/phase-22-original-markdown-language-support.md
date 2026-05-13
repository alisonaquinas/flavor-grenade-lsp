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
| Depends on | Phase 20 |

## Objective

Implement actual language support for the `original` flavor: historical core
Markdown constructs, deliberate exclusion of later extensions, and LSP behavior
that does not accidentally enable CommonMark, GFM, or Obsidian features.

## Scope

Support headings, paragraphs, blockquotes, lists, indented code, inline links,
images, emphasis, and raw HTML boundaries. Treat fenced code, pipe tables, task
lists, wiki links, and callouts as non-core constructs.

## Acceptance

- Original Markdown parsing affects diagnostics, completions, document links,
  folding, semantic tokens, and navigation.
- Unsupported extensions are ignored or reported as portability issues according
  to the profile.
- Spawned-server and BDD coverage prove behavior under `original`.

## Tickets

Ticket index: [[plans/phase-22-original-markdown-language-support/index]]
