---
id: "TASK-254"
title: "Concept Article: Opaque Regions"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-254"]
---

# Concept Article: Opaque Regions

> [!INFO] `TASK-254` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain opaque regions as places where OFM tokens should be ignored, such as
  code fences, inline code, math, comments, frontmatter, and Templater blocks.
- Describe why opaque marking happens before token parsing.
- Clarify which user problems this prevents, especially false diagnostics and
  unsafe edits inside generated or executable snippets.

## Asset Scope

- Include a Markdown snippet showing `[[Example]]` inside parsed and skipped
  regions.
- Include a region behavior table.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains parse ordering and false-positive prevention.
- [ ] Snippet and region table are present.
- [ ] Route metadata, sitemap, and tests include the article.

