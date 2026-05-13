---
title: "Phase W2: Content Pipeline And SEO Skeleton"
phase: W2
status: complete
tags: [plans, website, content, seo]
aliases: [Phase W2, Website Content Pipeline]
updated: 2026-05-09
---

# Phase W2: Content Pipeline And SEO Skeleton

| Field | Value |
|---|---|
| Phase | W2 |
| Title | Content Pipeline And SEO Skeleton |
| Status | complete |
| Gate | Static pages build with typed routes, metadata, sitemap, robots, and SEO checks |
| Depends on | Phase W1 |

## Objective

Build the typed content and metadata pipeline that turns website docs and
future public content into static SEO-ready pages.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [requirements/functional/public-pages](../../website/docs/requirements/functional/public-pages.md) | Define required public routes |
| [requirements/functional/seo-and-metadata](../../website/docs/requirements/functional/seo-and-metadata.md) | Generate required SEO metadata |
| [architecture/content-pipeline](../../website/docs/architecture/content-pipeline.md) | Implement typed route, metadata, and validation flow |
| [requirements/technical/source-layout-and-documentation](../../website/docs/requirements/technical/source-layout-and-documentation.md) | Keep internal Markdown and generated docs traceable |

## Scope

### In Scope

- Define route and metadata schemas.
- Build initial content loading or generated content data.
- Resolve internal public links for generated routes.
- Generate or maintain `robots.txt` and `sitemap.xml`.
- Add SEO validation tests.

### Out of Scope

- Final page copy for every docs page.
- Full client-side search.
- Production Pages deployment.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Route model | Typed route registry and navigation metadata |
| Content model | Typed page records for homepage and docs pages |
| SEO output | Canonical URLs, sitemap, robots, Open Graph, and JSON-LD skeletons |
| Validation | Build-time tests for metadata and links |

## Acceptance

- Required public routes exist as typed data.
- Each route has one H1, title, description, and canonical URL.
- `sitemap.xml` and `robots.txt` are generated or copied into the build output.
- Link and metadata tests pass in `website/tests`.
- Website build remains static and GitHub Pages compatible.

## Gate Verification

```bash
cd website
npm run typecheck
npm test
npm run build
```

## Tickets

- [[docs/plans/phase-W2-content-pipeline-seo/FEAT-035]]
- [[docs/plans/phase-W2-content-pipeline-seo/TASK-217]]
- [[docs/plans/phase-W2-content-pipeline-seo/TASK-218]]
- [[docs/plans/phase-W2-content-pipeline-seo/TASK-219]]
- [[docs/plans/phase-W2-content-pipeline-seo/CHORE-088]]

## Related

- [architecture/content-pipeline](../../website/docs/architecture/content-pipeline.md)
- [requirements/functional/seo-and-metadata](../../website/docs/requirements/functional/seo-and-metadata.md)

## Workflow Log

> [!INFO] Started · 2026-05-09
> Phase W2 began on `feature/phase-w2-content-pipeline-seo` after Phase W1 was
> merged and marked complete by PR #51 CI.

> [!SUCCESS] Local gate evidence · 2026-05-09
> `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass from
> `website/`. Repository docs lint, root lint/typecheck/unit tests, audits, and
> BDD `@smoke` also pass locally. Phase remains `in-progress` in the execution
> ledger until PR CI confirms the gate.

> [!CHECK] Complete · 2026-05-09
> PR #52 CI passed. Phase W2 is marked complete in the execution ledger.
