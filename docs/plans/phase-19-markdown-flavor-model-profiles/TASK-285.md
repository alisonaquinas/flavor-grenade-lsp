---
id: "TASK-285"
title: "Cover Original, CommonMark, and Obsidian profiles"
type: task
status: open
priority: high
phase: 19
parent: "FEAT-042"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-284"]
tags: [tickets/task, "phase/19", markdown-flavor]
aliases: ["TASK-285"]
---

# Cover Original, CommonMark, And Obsidian Profiles

## Description

Add focused tests and profile details for the first behavior-bearing flavors:
Original Markdown, CommonMark, and Obsidian.

## Work Scope

- Original Markdown marks fenced code, tables, tasks, and wiki links as non-core.
- CommonMark enables fenced code and excludes GFM/Obsidian constructs as core.
- Obsidian records wiki links, embeds, tags, block anchors, callouts, math,
  comments, and vault-local semantics.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-002`, `GAP-S-007` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | Original, CommonMark, and Obsidian profile assertions. |

## Definition of Done

- [ ] Original Markdown profile has historical baseline constraints.
- [ ] CommonMark profile has standardized core behavior.
- [ ] Obsidian profile maps current OFM parser capabilities.
