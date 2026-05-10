---
id: "TASK-278"
title: "Switch website facades to generated content"
type: task
status: green
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-277"]
tags: [tickets/task, "phase/W8", website, renderer, generated-typescript]
aliases: ["TASK-278"]
---

# Switch Website Facades To Generated Content

> [!INFO] `TASK-278` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `green`

## Description

Make generated TypeScript the website renderer input by switching the existing
content facades to consume `website/src/content/generated/*.generated.ts`.
Route-level app code should not know how Markdown is parsed or where copy files
live.

## Work Scope

- Update `website/src/content/pages.ts` to expose generated page records through
  the existing public API.
- Update route, navigation, media, or index facades only where needed to keep
  imports stable.
- Keep `App.svelte`, SEO helpers, and navigation code consuming stable facade
  APIs rather than Commonloom modules.
- Remove or quarantine hand-authored page body arrays once generated content is
  the source of truth.
- Ensure generated files remain ignored while fresh installs can build.

## Implementation Notes

Create or modify:

- `website/src/content/pages.ts`
- `website/src/content/routes.ts`
- `website/src/shell/navigation.ts`
- `website/src/seo/seo-files.ts`
- `website/src/content/pipeline/website/build.ts`
- `website/tests/content-pipeline-renderer-generated.test.ts`
- existing website route, sitemap, SEO, and content tests

The preferred migration shape is a compatibility facade:

```ts
import { websitePagesGenerated } from "./generated/pages.generated";

export const websitePages = websitePagesGenerated satisfies readonly WebsitePageContent[];
```

If generated route or navigation modules are switched in the same task, preserve
the existing exported type names and lookup helpers.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-renderer-generated.test.ts` | `websitePages` comes from generated page records. |
| existing `website/tests/*.test.ts` | Current route, navigation, sitemap, SEO, and content behavior still passes. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Existing renderer-facing content APIs consume generated TypeScript records.
- [x] Route-level Svelte and SEO code do not import Commonloom or Markdown
  parsing modules.
- [x] Hand-authored page body arrays are removed or clearly quarantined as
  migration fixtures.
- [x] FEAT-041's generated-renderer acceptance criterion is satisfied.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket added to close the remaining FEAT-041 acceptance gap: generated records
> must become the renderer input, not only generated audit output.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage requiring `website/src/content/pages.ts` to export
> generated page records and package test/typecheck gates to generate ignored
> records before importing them. Status: `red`.

> [!SUCCESS] Green implementation · 2026-05-10
> Switched `website/src/content/pages.ts` to a compatibility facade over
> `websitePagesGenerated`, removed the hand-authored page body arrays from the
> renderer path, and kept app, SEO, and navigation imports behind the stable
> content APIs. Verified with
> `npm test -- --run content-pipeline-renderer-generated content-pipeline-generated-from-markdown content-links quickstart-docs howto-faq-docs content-pipeline-parity`.
> Status: `green`.
