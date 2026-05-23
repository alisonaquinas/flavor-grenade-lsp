---
id: "FEAT-040"
title: "Website Guide Prose And Article Hubs"
type: feature
status: done
priority: high
phase: W7
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/feature, "phase/W7", website, prose, articles]
aliases: ["FEAT-040"]
---

# Website Guide Prose And Article Hubs

> [!INFO] `FEAT-040` · Feature · Phase W7 · Priority: `high` · Status: `done`

## Goal

Build out the public guide prose so How-To, Concepts, and Advanced Usage become
article hubs with real subpage articles, dropdown navigation, concrete examples,
and asset evidence.

## Scope

**In scope:**

- Dropdown navigation for How-To, Concepts, and Advanced Usage.
- Linked article lists on the How-To, Concepts, and Advanced Usage hubs.
- How-to task articles.
- Karpathy-style concept articles.
- Advanced topic articles.
- Text snippets, screenshots, diagrams, code examples, and route metadata for
  each article.
- Sitemap coverage for every article route.
- Tests for route completeness, link integrity, and content quality.

**Out of scope:**

- Publishing release tags.
- New product claims not supported by the current LSP and extension.
- Large visual redesign outside article navigation and content rendering.

## Acceptance Criteria

- [ ] Dropdown navigation exposes all article routes for How-To, Concepts, and
  Advanced Usage on desktop.
- [ ] Hubs link to all article routes in their group.
- [ ] Every article ticket has implemented prose and asset evidence.
- [ ] Articles include concrete Obsidian Vault paths, Markdown examples, or
  screenshots where specified.
- [ ] Sitemap and route metadata include every new article route.
- [ ] Public prose avoids internal phase and ticket language.
- [ ] Website lint, typecheck, tests, and build pass.
- [ ] Docs lint passes.

## Child Tasks

See [[docs/plans/phase-W7-website-guide-prose/index]] for the complete ticket list.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Feature created from browser review annotations requesting article dropdowns,
> linked hubs, and deeper prose pages. Status: `done`.

> [!SUCCESS] Implemented locally · 2026-05-09
> Phase W7 route inventory, article content, dropdown navigation, sitemap
> coverage, and regression tests are implemented. Local gates passed. Status:
> `done`.

> [!SUCCESS] CI verified · 2026-05-09
> PR #61 CI passed TypeScript typecheck, lint, dependency policy, format check,
> tests, OFM docs lint, markdownlint-cli2, website checks, and build. Status:
> `done`.

## Retrospective

> Written after Step L passes locally. Date: 2026-05-09.

### What went as planned

The route inventory in [[TASK-266]] gave the implementation a useful canonical
source for article metadata, hub links, dropdown navigation, and sitemap
coverage. Test-first route, content, and navigation checks made the article hub
work concrete before the Svelte renderer was updated.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| [[BUG-030]] | Bug | Replacing page content records removed existing quickstart regression phrases and required sitemap refresh work. | +0.3 h |

### Process observations

The strict RED -> GREEN workflow was useful for the route and hub behavior, but
the number of article tickets made per-ticket status updates noisy. Future
website prose phases should include a generated checklist or a smaller number
of aggregate article tickets when the implementation is data-driven.

### Carry-forward actions

- [ ] Keep public article prose conservative about direct LSP client support.
- [ ] Preserve existing regression-test phrases when replacing shared content
  records wholesale.

### Rule / template amendments

- [ ] None.
