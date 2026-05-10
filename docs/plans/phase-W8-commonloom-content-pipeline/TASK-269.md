---
id: "TASK-269"
title: "Parse Markdown and frontmatter"
type: task
status: planned
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-268"]
tags: [tickets/task, "phase/W8", website, markdown, frontmatter]
aliases: ["TASK-269"]
---

# Parse Markdown And Frontmatter

> [!INFO] `TASK-269` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `planned`

## Description

Implement Commonloom Markdown parsing with frontmatter extraction and full public
Markdown formatting support.

## Work Scope

- Parse CommonMark and GFM syntax, including headings, emphasis, strong text,
  blockquotes, ordered and unordered lists, task lists, tables, code fences,
  inline code, links, images, thematic breaks, and nested blocks.
- Extract frontmatter with `gray-matter`.
- Validate frontmatter through adapter-supplied `zod` schemas.
- Produce heading metadata for ids, labels, levels, and source positions where
  available.

## Definition of Done

- [ ] Unit tests cover representative CommonMark and GFM constructs.
- [ ] Invalid frontmatter reports a diagnostic instead of crashing generation.
- [ ] Heading extraction supports route anchors and content quality checks.
- [ ] Markdown body output is stable across repeated runs.
