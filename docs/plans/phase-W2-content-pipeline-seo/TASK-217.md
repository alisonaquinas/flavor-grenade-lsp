---
id: "TASK-217"
title: "Define typed route and metadata model"
type: task
status: done
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

> [!INFO] `TASK-217` · Task · Phase W2 · Parent: [[FEAT-035]] · Status: `done`

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

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/routes.test.ts` | Unit | `Website.Metadata.PageBasics` | ✅ passing |

## Definition of Done

- [x] Route IDs and paths are typed.
- [x] Page metadata includes title, description, canonical URL, H1, and page
  type.
- [x] Related-page links are represented in typed data.
- [x] Unit tests cover missing required metadata.
- [x] Parent feature child row is updated.

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

> [!SUCCESS] Green · 2026-05-09
> Added `website/src/content/routes.ts` with typed route IDs, metadata, related
> route links, canonical URLs, and metadata validation. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/routes.test.ts`. Definition of Done is satisfied locally.
> Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #52 CI passed with the typed route metadata coverage in place. Status:
> `done`.
