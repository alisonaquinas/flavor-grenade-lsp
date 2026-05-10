---
id: "TASK-274"
title: "Migrate existing content into Markdown copy"
type: task
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-273"]
tags: [tickets/task, "phase/W8", website, migration]
aliases: ["TASK-274"]
---

# Migrate Existing Content Into Markdown Copy

> [!INFO] `TASK-274` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Move existing public page and W7 article copy into Markdown files and manifests.

## Work Scope

- Create Markdown copy files under `website/src/content/copy`.
- Move page metadata that belongs to each document into frontmatter.
- Keep page-group and route mapping data in manifests.
- Preserve existing page ids, routes, titles, summaries, sitemap data, and
  article group membership.
- Move or reference images through `website/src/content/media`.

## Implementation Notes

Create or modify:

- `website/src/content/copy/home/index.md`
- `website/src/content/copy/quickstart/index.md`
- `website/src/content/copy/how-to/*.md`
- `website/src/content/copy/concepts/*.md`
- `website/src/content/copy/advanced/*.md`
- `website/src/content/copy/faq/index.md`
- `website/src/content/media/**`
- `website/src/content/docs.manifest.ts`
- `website/src/content/pages.ts`
- `website/src/content/routes.ts`
- `website/src/content/wiki.ts`
- `website/src/content/links.ts`
- `website/tests/content-pipeline-migration.test.ts`
- existing route/content tests under `website/tests/*.test.ts`

Migration inventory:

- `website/src/content/pages.ts` page body and article records move to
  Markdown copy.
- `website/src/content/routes.ts` route metadata remains hand-authored until
  generated replacement is wired.
- `website/src/content/wiki.ts` concept wiki page copy moves to Markdown where
  it is public page prose.
- `website/src/content/links.ts` remains the public external-link registry.

## Linked Requirements

- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]
- [[../../../website/docs/requirements/functional/public-pages]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-migration.test.ts` | Every migrated route has Markdown copy and a manifest entry. |
| existing `website/tests/*.test.ts` | Existing article, route, sitemap, and content regression phrases still pass. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Existing public content can be regenerated from Markdown and manifests.
- [ ] No route disappears from the sitemap.
- [ ] Existing regression phrases remain covered by tests unless intentionally
  replaced in the same commit.
- [ ] Article hubs still list the expected articles and summaries.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.
