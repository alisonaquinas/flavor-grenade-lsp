---
title: Phase 26 GitLab Flavored Markdown Language Support Tickets
phase: 26
status: done
tags: [plans/phase-26, tickets/index, glfm]
aliases: ["Phase 26 Tickets"]
updated: 2026-05-13
---

# Phase 26 GitLab Flavored Markdown Language Support Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[FEAT-052]] | GitLab Flavored Markdown Language Support | Feature | `done` |
| [[TASK-327]] | Implement GLFM parser semantics | Task | `done` |
| [[TASK-328]] | Add GLFM diagnostics and LSP features | Task | `done` |
| [[TASK-329]] | Add GLFM tests and validation evidence | Task | `done` |
| [[CHORE-123]] | Phase 26 trace and documentation sweep | Chore | `done` |
| [[CHORE-124]] | Phase 26 verification and closeout sweep | Chore | `done` |
| [[CHORE-144]] | Split GLFM description-list parser helper | Chore | `done` |

## Ticket Details

`TASK-327` covers GLFM/CommonMark/GFM baseline plus GitLab references, media
behavior, and heading/link conventions that can be modeled locally.

`TASK-328` wires diagnostics, completions, semantic tokens, document links, and
navigation while separating host-only GitLab behavior.

`TASK-329` adds unit coverage via
[[docs/test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]]
plus integration, BDD, and validation coverage for `glfm`.

## Deferred Follow-Up Notes

Live GitLab issue, merge request, commit, user, and project metadata lookup is
out of scope for Phase 26. Any later networked GitLab lookup must be opened as a
separate platform-integration ticket; Phase 26 remains responsible for local
GLFM syntax, reference-shape recognition, and portability diagnostics.
