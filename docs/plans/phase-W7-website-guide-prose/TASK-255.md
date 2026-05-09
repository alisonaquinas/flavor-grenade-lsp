---
id: "TASK-255"
title: "Concept Article: Diagnostics"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-255"]
---

# Concept Article: Diagnostics

> [!INFO] `TASK-255` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain diagnostics as vault-aware feedback for missing wiki-links, unresolved
  headings, missing attachments, and unsupported local targets.
- Describe how diagnostics should be practical: they should point to a fixable
  vault problem and avoid noisy false positives.
- Include LLM maintainer guidance for adding diagnostics only when resolution
  rules can support them.

## Asset Scope

- Include a diagnostic examples table with syntax, problem, and expected
  message category.
- Reuse an existing diagnostics screenshot if available; otherwise use a
  highlighted Markdown snippet.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains diagnostic meaning and noise boundaries.
- [ ] Diagnostic example table or screenshot is present.
- [ ] Route metadata, sitemap, and tests include the article.

