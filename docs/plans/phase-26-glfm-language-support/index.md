---
title: Phase 26 GitLab Flavored Markdown Language Support Tickets
phase: 26
status: planned
tags: [plans/phase-26, tickets/index, glfm]
aliases: ["Phase 26 Tickets"]
updated: 2026-05-13
---

# Phase 26 GitLab Flavored Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-052]] | GitLab Flavored Markdown Language Support | Feature | `draft` |
| [[TASK-327]] | Implement GLFM parser semantics | Task | `open` |
| [[TASK-328]] | Add GLFM diagnostics and LSP features | Task | `open` |
| [[TASK-329]] | Add GLFM tests and validation evidence | Task | `open` |
| [[CHORE-123]] | Phase 26 trace and documentation sweep | Chore | `open` |
| [[CHORE-124]] | Phase 26 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-327` covers GLFM/CommonMark/GFM baseline plus GitLab references, media
behavior, and heading/link conventions that can be modeled locally.

`TASK-328` wires diagnostics, completions, semantic tokens, document links, and
navigation while separating host-only GitLab behavior.

`TASK-329` adds unit, integration, BDD, and validation coverage for `glfm`.
