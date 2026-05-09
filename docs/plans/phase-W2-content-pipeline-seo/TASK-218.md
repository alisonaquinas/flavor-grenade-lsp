---
id: "TASK-218"
title: "Build content transform and link model"
type: task
status: open
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

> [!INFO] `TASK-218` · Task · Phase W2 · Parent: [[FEAT-035]] · Status: `open`

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

## Definition of Done

- [ ] Content records can feed static route rendering.
- [ ] Internal route links resolve to public URLs.
- [ ] Required outbound links are represented with descriptive text.
- [ ] Broken public links fail tests.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Content/link model file paths, exported API shape, and RED test target were
> recorded before implementation.
