---
id: "TASK-286"
title: "Cover remaining researched flavor profiles"
type: task
status: done
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
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | ✅ Passing coverage for all remaining researched flavor signatures and host/conversion boundaries. |

## Implementation Notes

- Populate profiles for `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`.
- Source traces must point to the matching `docs/features/*-flavor.md` page and `docs/research/*` note.
- Platform, renderer, conversion, MDX/ESM, and execution-bound constructs must be listed under `hostSpecificSyntax` or boundary metadata, not as locally resolvable syntax.
- RED assertions live in `src/parser/__tests__/markdown-flavor-profiles.test.ts`.

## Definition of Done

- [x] Every researched explicit flavor has signature behavior.
- [x] Platform-specific behavior is labeled as host-specific.
- [x] Test coverage fails on missing profile sources.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing assertions added for GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, and Stack Overflow before profile data exists.

> [!NOTE] GREEN - 2026-05-13
> Added all remaining researched profile signatures and host/conversion boundaries; focused profile test passes.

> [!INFO] In Review - 2026-05-13
> Lint, typecheck, unit, integration, BDD, docs lint, format, and build gates passed locally; awaiting PR CI.

> [!CHECK] Done - 2026-05-13
> PR #69 CI run `25815957887` passed.
