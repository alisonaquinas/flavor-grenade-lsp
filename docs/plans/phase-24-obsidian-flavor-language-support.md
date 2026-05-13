---
title: "Phase 24: Obsidian Flavor Language Support"
phase: 24
status: planned
tags: [plans, markdown-flavor, obsidian, language-support]
aliases: [Phase 24, Obsidian Flavor Support]
updated: 2026-05-13
---

# Phase 24: Obsidian Flavor Language Support

| Field | Value |
|---|---|
| Phase | 24 |
| Title | Obsidian Flavor Language Support |
| Status | planned |
| Gate | Existing OFM behavior is represented as the `obsidian` flavor without language-mode promotion |
| Depends on | Phase 23, Phase E15 |

## Objective

Reframe existing Obsidian Flavored Markdown intelligence as actual support for
the `obsidian` flavor under the new selector model.

## Scope

Preserve wiki links, embeds, block anchors, tags, callouts, frontmatter, math,
comments, Templater opaque regions, vault-local resolution, completions,
diagnostics, navigation, rename, semantic tokens, document links, folding, and
selection ranges.

## Acceptance

- Obsidian behavior works when effective flavor is `obsidian`.
- `.md` documents stay in VS Code `markdown` language mode.
- Tests prove Obsidian features are gated by flavor and no longer by
  `ofmarkdown`.

## Tickets

Ticket index: [[plans/phase-24-obsidian-flavor-language-support/index]]
