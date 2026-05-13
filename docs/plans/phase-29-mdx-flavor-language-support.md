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

## Acceptance

- Selecting `mdx` as a flavor only applies to documents whose VS Code language
  remains `markdown`.
- Manual `mdx` language documents are preserved and not overwritten.
- Integration, host, and BDD coverage prove the distinction.

## Tickets

Ticket index: [[plans/phase-29-mdx-flavor-language-support/index]]
