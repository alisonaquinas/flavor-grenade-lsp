---
id: "TASK-219"
title: "Generate SEO files and validation tests"
type: task
status: done
priority: high
phase: W2
parent: "FEAT-035"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-217", "TASK-218"]
tags: [tickets/task, "phase/W2", website, seo]
aliases: ["TASK-219"]
---

# Generate SEO Files And Validation Tests

> [!INFO] `TASK-219` · Task · Phase W2 · Parent: [[FEAT-035]] · Status: `done`

## Description

Generate or maintain `sitemap.xml`, `robots.txt`, canonical metadata, Open
Graph metadata, and JSON-LD skeletons for public routes.

## Implementation Details

Create SEO helpers and maintained static crawl files in:

- `website/src/seo/seo-files.ts`
- `website/public/robots.txt`
- `website/public/sitemap.xml`

Expected public API:

- `generateSitemap(routes): string`
- `generateRobotsTxt(siteMapUrl): string`
- `getHomeMetadata(): Record<string, string>`
- `generateJsonLd(routes, pages): object[]`

Add RED coverage in `website/tests/seo-files.test.ts` before implementation.
Tests should verify static files match the generated output and that
`website/dist` includes crawl files after `npm run build`.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/seo-files.test.ts` | Unit | `Website.Indexing.SitemapRobots` | ✅ passing |

## Definition of Done

- [x] Build output includes `sitemap.xml`.
- [x] Build output includes `robots.txt`.
- [x] Homepage includes Open Graph and Twitter metadata.
- [x] JSON-LD generation covers the required initial page types.
- [x] SEO validation tests pass.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> SEO helper file paths, maintained crawl files, exported API shape, and RED
> test target were recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/seo-files.test.ts`, which expects SEO helper modules and
> maintained crawl files before they exist. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added SEO helpers, maintained `robots.txt` and `sitemap.xml`, homepage social
> metadata, and JSON-LD skeleton generation. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/seo-files.test.ts`. Definition of Done is satisfied locally.
> Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #52 CI passed with crawl-file and structured-data coverage in place.
> Status: `done`.
