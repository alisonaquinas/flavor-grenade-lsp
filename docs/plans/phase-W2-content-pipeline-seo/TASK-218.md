---
id: "TASK-218"
title: "Build content transform and link model"
type: task
status: done
priority: high
phase: W2
parent: "FEAT-035"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-217"]
tags: [tickets/task, "phase/W2", website, content]
aliases: ["TASK-218"]
---

# Build Content Transform And Link Model

> [!INFO] `TASK-218` · Task · Phase W2 · Parent: [[FEAT-035]] · Status: `done`

## Description

Implement the first content transform or typed content records and validate
that public links resolve to static routes or approved outbound URLs.

## Implementation Details

Create the content and public-link model in:

- `website/src/content/links.ts`
- `website/src/content/pages.ts`

Expected public API:

- `PublicLink` discriminated union for route links and outbound links
- `approvedOutboundHosts: readonly string[]`
- `validatePublicLinks(links, routes): string[]`
- `WebsitePageContent` interface with `routeId`, `summary`, `sections`, and
  `links`
- `websitePages: readonly WebsitePageContent[]`
- `validateWebsitePages(pages, routes): string[]`

Add RED coverage in `website/tests/content-links.test.ts` before
implementation.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/content-links.test.ts` | Unit | `Website.Pages.RequiredSet` | ✅ passing |

## Definition of Done

- [x] Content records can feed static route rendering.
- [x] Internal route links resolve to public URLs.
- [x] Required outbound links are represented with descriptive text.
- [x] Broken public links fail tests.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Content/link model file paths, exported API shape, and RED test target were
> recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/content-links.test.ts`, which expects the content and
> public-link modules before they exist. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added typed public links, approved outbound hosts, starter page content, and
> content/link validation. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/content-links.test.ts`. Definition of Done is satisfied
> locally. Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #52 CI passed with content and public-link validation in place. Status:
> `done`.
