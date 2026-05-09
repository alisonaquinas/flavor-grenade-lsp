---
id: "TASK-248"
title: "Article: Work with OFM Opaque Regions"
type: task
status: open
priority: medium
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-248"]
---

# Article: Work With OFM Opaque Regions

> [!INFO] `TASK-248` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain why code fences, math, comments, frontmatter, callouts, and Templater
  regions should not create false link diagnostics.
- Include steps for checking whether an apparent link is ignored intentionally.
- Use examples containing `[[Sample Link]]` inside code, math, and comments.

## Asset Scope

- Include a before and after parser-region snippet.
- Add a small table of opaque region types and expected behavior.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose includes practical examples for opaque parsing behavior.
- [ ] Opaque-region table or snippet is present.
- [ ] Route metadata, sitemap, and tests include the article.
