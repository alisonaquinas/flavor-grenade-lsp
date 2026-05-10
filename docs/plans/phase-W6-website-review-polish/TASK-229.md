---
id: "TASK-229"
title: "Repair homepage and footer image rendering"
type: task
status: done
priority: high
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, assets, accessibility]
aliases: ["TASK-229"]
---

# Repair Homepage And Footer Image Rendering

> [!INFO] `TASK-229` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `done`

## Description

Fix broken image rendering in the reviewed homepage header, homepage proof
panel, and footer brand block.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 1 | Header product icon | Image is broken |
| 2 | Footer product icon | Image is broken |
| 5 | Homepage proof image | Broken icon |

## Implementation Details

Create or update tests before implementation:

- `website/tests/asset-rendering.test.ts` or a focused update to existing
  homepage/footer tests.
- Source paths likely involved: `website/src/App.svelte`,
  `website/src/home/homepage.ts`, `website/src/shell/footer.ts`, and asset
  references under `docs/assets/` or `extension/images/`.

Expected behavior:

- Header brand icon resolves through Vite and loads in development and
  production builds.
- Footer brand icon resolves through Vite and loads in development and
  production builds.
- Hero proof screenshot resolves through Vite and loads in development and
  production builds.
- Images keep useful `alt` text or deliberate decorative hiding.

## Definition of Done

- [x] Failing regression test exists before implementation.
- [x] Header brand icon renders without a broken-image icon.
- [x] Footer brand icon renders without a broken-image icon.
- [x] Homepage proof image renders without a broken-image icon.
- [x] Accessible text remains meaningful.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review comments 1, 2, and 5. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added asset placement coverage requiring reviewed header, hero, and footer
> images to resolve from `website/public/assets`.

> [!SUCCESS] Green · 2026-05-09
> Copied reviewed artwork into `website/public/assets` and updated homepage and
> shell image sources to use public static asset paths.

> [!CHECK] CI verified · 2026-05-09
> PR #58 merged with green CI. Website checks, tests, typecheck, lint, docs lint,
> and build passed for the W6 implementation branch.
