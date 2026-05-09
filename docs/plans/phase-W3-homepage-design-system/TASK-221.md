---
id: "TASK-221"
title: "Implement homepage hero and product proof sections"
type: task
status: open
priority: high
phase: W3
parent: "FEAT-036"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-220"]
tags: [tickets/task, "phase/W3", website, homepage]
aliases: ["TASK-221"]
---

# Implement Homepage Hero And Product Proof Sections

> [!INFO] `TASK-221` · Task · Phase W3 · Parent: [[FEAT-036]] · Status: `open`

## Description

Implement the homepage first viewport, Marketplace CTA, product demo panel, and
feature proof sections using real product concepts and existing brand assets.

## Implementation Details

Create and wire:

- `website/src/home/homepage.ts`
- `website/tests/homepage.test.ts`
- `website/src/App.svelte`
- `website/src/styles/global.scss`

Expected API:

- `homepageHero`
- `homepageProof`
- `featureHighlights`
- `homepageAssetPlacements`
- `validateHomepageContent()`

Add RED coverage in `website/tests/homepage.test.ts` before implementation.

## Definition of Done

- [ ] H1 identifies Flavor Grenade LSP.
- [ ] First viewport states Obsidian Flavored Markdown language server and VS
  Code extension.
- [ ] Primary actions include quickstart and Visual Studio Marketplace.
- [ ] Product demo shows real editor, command, diagnostic, or vault behavior.
- [ ] Feature sections avoid identical card-grid monotony.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Homepage data, app rendering, style paths, exported API shape, and RED test
> target were recorded before implementation.
