---
id: "TASK-222"
title: "Implement footer byline and attribution links"
type: task
status: in-review
priority: medium
phase: W3
parent: "FEAT-036"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-220"]
tags: [tickets/task, "phase/W3", website, attribution]
aliases: ["TASK-222"]
---

# Implement Footer Byline And Attribution Links

> [!INFO] `TASK-222` · Task · Phase W3 · Parent: [[FEAT-036]] · Status: `in-review`

## Description

Implement the global footer with product metadata, "Vibe-coded by: Alison
Aquinas", Alison profile links, GitHub, Visual Studio Marketplace, and
inspiration links.

## Implementation Details

Create and wire:

- `website/src/shell/footer.ts`
- `website/tests/footer.test.ts`
- `website/src/App.svelte`
- `website/src/styles/global.scss`

Expected API:

- `footerByline`
- `profileLinks`
- `projectLinks`
- `inspirationLinks`
- `validateFooterLinks()`

Add RED coverage in `website/tests/footer.test.ts` before implementation.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/footer.test.ts` | Unit | `Website.Attribution.CreatorByline` | ✅ passing |

## Definition of Done

- [x] Footer includes product name or logo.
- [x] Footer includes creator byline.
- [x] Footer links to Alison's website, GitHub, and LinkedIn.
- [x] Footer links to GitHub repository and Visual Studio Marketplace.
- [x] Footer links to Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP.
- [x] Mobile footer keeps the byline visible.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Footer data, app rendering, style paths, exported API shape, and RED test
> target were recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/footer.test.ts`, which expects footer link data before it
> exists. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added footer link data, creator byline, profile links, project links,
> inspiration links, and footer rendering. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/footer.test.ts`. Definition of Done is satisfied locally.
> Status: `in-review`.
