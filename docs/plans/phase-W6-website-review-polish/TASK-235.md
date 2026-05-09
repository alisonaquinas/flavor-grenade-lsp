---
id: "TASK-235"
title: "Make feature proof cards selectable"
type: task
status: green
priority: high
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, homepage, interaction]
aliases: ["TASK-235"]
---

# Make Feature Proof Cards Selectable

> [!INFO] `TASK-235` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `green`

## Description

Convert the homepage product proof cards from static cards into selectable
controls that reveal deeper practical detail for each capability.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 1 | Product proof feature cards | Cards should feel more interactive and selectable so deeper practical detail can be shown. |

## Implementation Details

Create or update tests before implementation:

- Homepage content tests should require practical detail content for every
  feature proof card.
- Shell or interaction tests should require keyboard-selectable card controls
  with selected state.

Expected behavior:

- Each feature card is selectable with pointer and keyboard input.
- Selecting a card updates a visible detail region.
- Detail content demonstrates how Flavor Grenade and related Markdown linting
  workflows practically perform the capability in an Obsidian Vault.
- Details should include concrete Markdown, indexed vault context, diagnostic,
  completion, rename, or consistency behavior where relevant.
- Selected state must have an accessible name or state and a visible focus
  treatment.

## Definition of Done

- [x] Failing regression test exists before implementation.
- [x] Each feature proof card is selectable.
- [x] Keyboard selection works.
- [x] Selected state is visually clear and accessible.
- [x] Detail panel updates with capability-specific practical content.
- [x] Browser screenshot verifies the interaction on mobile and desktop.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from second-round browser review comment 1. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added homepage coverage requiring practical detail for each selectable
> feature proof card and shell coverage for selected-state semantics.

> [!SUCCESS] Green · 2026-05-09
> Added selectable feature proof buttons and a live detail panel with
> capability-specific Markdown examples and outcomes.

> [!SUCCESS] Width polish · 2026-05-09
> Expanded the feature detail panel to span the full feature section width
> established by the four-card row.

> [!SUCCESS] Mobile expansion · 2026-05-09
> Updated narrow viewports so selected feature cards expand inline with their
> own detail content, while desktop keeps the separate full-width detail panel.
