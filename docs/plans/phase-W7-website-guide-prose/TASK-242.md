---
id: "TASK-242"
title: "Article: Fix Broken Links"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-242"]
---

# Article: Fix Broken Links

> [!INFO] `TASK-242` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain broken wiki-link, Markdown link, heading anchor, and attachment
  diagnostics.
- Include steps for inspecting the diagnostic, creating or correcting the
  target, and confirming the diagnostic clears.
- Use examples: `[[Missing Note]]`, `[[Project Plan#Risks]]`, and
  `[diagram](assets/missing.png)`.

## Asset Scope

- Reuse existing diagnostic or hover screenshot if available.
- Include a before and after Markdown snippet.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose includes expected result and common failure mode.
- [ ] Diagnostic asset or equivalent code example is present.
- [ ] Route metadata, sitemap, and tests include the article.
