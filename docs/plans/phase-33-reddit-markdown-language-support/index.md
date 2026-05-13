---
title: Phase 33 Reddit Markdown Language Support Tickets
phase: 33
status: planned
tags: [plans/phase-33, tickets/index, reddit]
aliases: ["Phase 33 Tickets"]
updated: 2026-05-13
---

# Phase 33 Reddit Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-059]] | Reddit Markdown Language Support | Feature | `draft` |
| [[TASK-348]] | Implement Reddit Markdown parser semantics | Task | `open` |
| [[TASK-349]] | Add Reddit diagnostics and LSP features | Task | `open` |
| [[TASK-350]] | Add Reddit tests and validation evidence | Task | `open` |
| [[CHORE-137]] | Phase 33 trace and documentation sweep | Chore | `open` |
| [[CHORE-138]] | Phase 33 verification and closeout sweep | Chore | `open` |

## Ticket Details

`TASK-348` covers Reddit-specific Markdown constructs, escaping, line-break
behavior, supported spoiler syntax, and portability boundaries.

`TASK-349` wires diagnostics, semantic tokens, folding, and guidance-oriented
completion or quick fixes where useful.

`TASK-350` adds unit, integration, BDD, and validation coverage for `reddit`.
