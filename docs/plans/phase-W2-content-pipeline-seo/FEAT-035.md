---
id: "FEAT-035"
title: "Content Pipeline And SEO Skeleton"
type: feature
status: done
priority: high
phase: W2
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-034"]
tags: [tickets/feature, "phase/W2", website, seo]
aliases: ["FEAT-035"]
---

# Content Pipeline And SEO Skeleton

> [!INFO] `FEAT-035` · Feature · Phase W2 · Priority: `high` · Status: `done`

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
| Public page model | [[website/docs/requirements/functional/public-pages]] |
| SEO and metadata | [[website/docs/requirements/functional/seo-and-metadata]] |
| Content pipeline architecture | [[website/docs/architecture/content-pipeline]] |

## Acceptance Criteria

- [x] All required routes are represented in typed data.
- [x] Every route has title, description, canonical URL, and H1.
- [x] Sitemap and robots output are present in the build.
- [x] SEO validation tests pass.
- [x] `FEAT-035` child rows are updated.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-217]] | Define typed route and metadata model | `done` |
| [[TASK-218]] | Build content transform and link model | `done` |
| [[TASK-219]] | Generate SEO files and validation tests | `done` |
| [[CHORE-088]] | Phase W2 content pipeline verification sweep | `done` |

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created for Phase W2 content and SEO pipeline. Status: `ready`.

> [!INFO] Started · 2026-05-09
> Phase W2 started after W1 completed in PR #51. Status: `in-progress`.

> [!INFO] TASK-217 red · 2026-05-09
> TASK-217 entered `red` with a failing route metadata test.

> [!SUCCESS] TASK-217 green · 2026-05-09
> TASK-217 added the typed route metadata registry and route validation.

> [!INFO] TASK-218 red · 2026-05-09
> TASK-218 entered `red` with a failing content/link validation test.

> [!SUCCESS] TASK-218 green · 2026-05-09
> TASK-218 added starter content records, public links, and validation.

> [!INFO] TASK-219 red · 2026-05-09
> TASK-219 entered `red` with a failing SEO file and structured-data test.

> [!SUCCESS] TASK-219 green · 2026-05-09
> TASK-219 added sitemap, robots, homepage metadata, and JSON-LD skeleton
> coverage.

> [!INFO] Implementation tasks in review · 2026-05-09
> TASK-217, TASK-218, and TASK-219 moved to `in-review` after updating website
> test index and matrix entries.

> [!INFO] Verification sweep started · 2026-05-09
> CHORE-088 entered `in-progress` to run Phase W2 local gates and Step E-L
> evidence.

> [!SUCCESS] Ready for PR · 2026-05-09
> Phase W2 local gates passed. Steps J, K, and validation-folder checks were
> N/A because `tests/integration`, `tests/verification`, and `tests/validation`
> do not contain phase-specific test files; BDD `@smoke` passed. Status:
> `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #52 CI passed. All child tickets are `done`, the retrospective is present,
> and the execution ledger marks W2 complete. Status: `done`.

## Retrospective

> Written after Step L passes. Date: 2026-05-09.

### What went as planned

Typed route metadata, starter content records, public-link validation, and SEO
file checks fit the planned W2 split across TASK-217 through TASK-219.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | — | No Step E-L defects were found. | 0 h |

During TASK-219 implementation, `replaceAll` was adjusted to regex
replacement because the current website TypeScript target does not include the
newer string helper. That happened before the sweep and did not require a
follow-up ticket.

### Process observations

The sitemap is maintained as a static public file but tested against generated
route metadata. This is a good interim fit until a later phase adds a dedicated
prebuild generation step.

### Carry-forward actions

- [ ] W3 should consume `websiteRoutes` and `websitePages` in visible Svelte UI
  so the homepage is no longer independent from the typed content model.

### Rule / template amendments

- [ ] None.
