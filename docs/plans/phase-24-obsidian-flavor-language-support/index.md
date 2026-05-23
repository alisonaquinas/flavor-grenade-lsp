---
title: Phase 24 Obsidian Flavor Language Support Tickets
phase: 24
status: in-review
tags: [plans/phase-24, tickets/index, obsidian]
aliases: ["Phase 24 Tickets"]
updated: 2026-05-13
---

# Phase 24 Obsidian Flavor Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-050]] | Obsidian Flavor Language Support | Feature | `in-review` |
| [[TASK-321]] | Rebase existing OFM parser behavior onto the Obsidian flavor | Task | `done` |
| [[TASK-322]] | Gate Obsidian diagnostics and LSP features by flavor | Task | `done` |
| [[TASK-323]] | Add Obsidian flavor regression and selector-mode coverage | Task | `done` |
| [[CHORE-119]] | Phase 24 trace and documentation sweep | Chore | `done` |
| [[CHORE-120]] | Phase 24 verification and closeout sweep | Chore | `done` |
| [[CHORE-142]] | Clarify Phase 24 Obsidian parser test title | Chore | `done` |

## Ticket Details

`TASK-321` ensures wiki links, embeds, tags, block anchors, callouts,
frontmatter, math, comments, and vault semantics belong to `obsidian`.

`TASK-322` gates diagnostics, completion, navigation, rename, semantic tokens,
folding, selection ranges, and document links by effective flavor.

`TASK-323` proves Obsidian features work without `ofmarkdown` language-mode
promotion.
