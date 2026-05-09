---
id: "TASK-222"
title: "Implement footer byline and attribution links"
type: task
status: open
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

> [!INFO] `TASK-222` · Task · Phase W3 · Parent: [[FEAT-036]] · Status: `open`

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

## Definition of Done

- [ ] Footer includes product name or logo.
- [ ] Footer includes creator byline.
- [ ] Footer links to Alison's website, GitHub, and LinkedIn.
- [ ] Footer links to GitHub repository and Visual Studio Marketplace.
- [ ] Footer links to Karpathy's LLM Wiki concept, Obsidian, and Marksman LSP.
- [ ] Mobile footer keeps the byline visible.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Footer data, app rendering, style paths, exported API shape, and RED test
> target were recorded before implementation.
