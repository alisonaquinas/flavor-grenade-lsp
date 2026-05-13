---
id: "TASK-285"
title: "Cover Original, CommonMark, and Obsidian profiles"
type: task
status: green
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
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | ✅ Passing coverage for Original, CommonMark, and Obsidian signature boundaries. |

## Implementation Notes

- Populate `MARKDOWN_FLAVOR_PROFILES.original`, `.commonmark`, and `.obsidian` in `src/markdown-flavor/markdown-flavor-profiles.ts`.
- Original profile must mark fenced code, pipe tables, task lists, wiki links, embeds, tags, and callouts as inert/non-core.
- CommonMark profile must activate fenced code, CommonMark block/inline structure, link labels, and headings while keeping GFM/Obsidian constructs inert.
- Obsidian profile must activate wiki links, embeds, tags, block anchors/refs, callouts, frontmatter, opaque regions, and vault-local Markdown links.
- RED assertions live in `src/parser/__tests__/markdown-flavor-profiles.test.ts`.

## Definition of Done

- [x] Original Markdown profile has historical baseline constraints.
- [x] CommonMark profile has standardized core behavior.
- [x] Obsidian profile maps current OFM parser capabilities.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing assertions added for core and Obsidian profile boundaries before profile data exists.

> [!NOTE] GREEN - 2026-05-13
> Added Original, CommonMark, and Obsidian profile signatures; focused profile test passes.
