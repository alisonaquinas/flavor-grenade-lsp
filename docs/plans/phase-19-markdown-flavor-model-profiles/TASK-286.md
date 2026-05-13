---
id: "TASK-286"
title: "Cover remaining researched flavor profiles"
type: task
status: open
priority: medium
phase: 19
parent: "FEAT-042"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-284"]
tags: [tickets/task, "phase/19", markdown-flavor]
aliases: ["TASK-286"]
---

# Cover Remaining Researched Flavor Profiles

## Description

Add profile details for GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown,
Markdown Extra, R Markdown, Reddit, and Stack Overflow.

## Work Scope

- Record source slug and signature behavior for each flavor.
- Distinguish platform behavior from portable Markdown syntax.
- Treat MDX and R Markdown as flavor profiles without owning VS Code language
  ids.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.RequiredCoverage` | `GAP-S-001` |
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-002` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | Remaining researched flavor source and signature assertions. |

## Definition of Done

- [ ] Every researched explicit flavor has signature behavior.
- [ ] Platform-specific behavior is labeled as host-specific.
- [ ] Test coverage fails on missing profile sources.
