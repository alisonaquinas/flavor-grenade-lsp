---
id: "FEAT-035"
title: "Content Pipeline And SEO Skeleton"
type: feature
status: in-progress
priority: high
phase: W2
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-034"]
tags: [tickets/feature, "phase/W2", website, seo]
aliases: ["FEAT-035"]
---

# Content Pipeline And SEO Skeleton

> [!INFO] `FEAT-035` · Feature · Phase W2 · Priority: `high` · Status: `in-progress`

## Goal

The website can build typed static pages with route metadata, internal links,
canonical URLs, sitemap, robots, and SEO validation before visual polish begins.

## Scope

**In scope:**

- Route registry and page metadata types.
- Initial content records for required public pages.
- Public link model and link validation.
- `sitemap.xml`, `robots.txt`, Open Graph, and JSON-LD skeletons.
- Tests for content and metadata integrity.

**Out of scope:**

- Final page copy for all docs.
- Full client-side search.
- GitHub Pages deployment.

## Linked Requirements

| Requirement | Source |
|---|---|
| Public page model | [[../../../website/docs/requirements/functional/public-pages]] |
| SEO and metadata | [[../../../website/docs/requirements/functional/seo-and-metadata]] |
| Content pipeline architecture | [[../../../website/docs/architecture/content-pipeline]] |

## Acceptance Criteria

- [ ] All required routes are represented in typed data.
- [ ] Every route has title, description, canonical URL, and H1.
- [ ] Sitemap and robots output are present in the build.
- [ ] SEO validation tests pass.
- [ ] `FEAT-035` child rows are updated.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-217]] | Define typed route and metadata model | `green` |
| [[TASK-218]] | Build content transform and link model | `open` |
| [[TASK-219]] | Generate SEO files and validation tests | `open` |
| [[CHORE-088]] | Phase W2 content pipeline verification sweep | `open` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created for Phase W2 content and SEO pipeline. Status: `ready`.

> [!INFO] Started · 2026-05-09
> Phase W2 started after W1 completed in PR #51. Status: `in-progress`.

> [!INFO] TASK-217 red · 2026-05-09
> TASK-217 entered `red` with a failing route metadata test.

> [!SUCCESS] TASK-217 green · 2026-05-09
> TASK-217 added the typed route metadata registry and route validation.
