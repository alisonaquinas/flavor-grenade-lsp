---
id: "TASK-217"
title: "Define typed route and metadata model"
type: task
status: red
priority: high
phase: W2
parent: "FEAT-035"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-034"]
tags: [tickets/task, "phase/W2", website, seo]
aliases: ["TASK-217"]
---

# Define Typed Route And Metadata Model

> [!INFO] `TASK-217` · Task · Phase W2 · Parent: [[FEAT-035]] · Status: `red`

## Description

Create typed route and metadata modules for homepage, quickstart, how-to,
concepts, advanced usage, FAQ, and feature pages.

## Implementation Details

Create the route metadata model in `website/src/content/routes.ts`.

Expected public API:

- `siteBaseUrl: string`
- `routeIds: readonly RouteId[]`
- `WebsiteRoute` interface with `id`, `path`, `title`, `description`, `h1`,
  `pageType`, `canonicalUrl`, `related`, and `seo` fields
- `websiteRoutes: readonly WebsiteRoute[]`
- `getRouteById(id: RouteId): WebsiteRoute`
- `validateRouteMetadata(routes: readonly WebsiteRoute[]): string[]`

Add RED coverage in `website/tests/routes.test.ts` before implementation.

## Definition of Done

- [ ] Route IDs and paths are typed.
- [ ] Page metadata includes title, description, canonical URL, H1, and page
  type.
- [ ] Related-page links are represented in typed data.
- [ ] Unit tests cover missing required metadata.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Route metadata file paths, exported API shape, and RED test target were
> recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/routes.test.ts`, which expects the route metadata module
> before it exists. Status: `red`.
