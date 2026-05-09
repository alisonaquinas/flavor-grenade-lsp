---
id: "FEAT-040"
title: "Website Guide Prose And Article Hubs"
type: feature
status: ready
priority: high
phase: W7
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/feature, "phase/W7", website, prose, articles]
aliases: ["FEAT-040"]
---

# Website Guide Prose And Article Hubs

> [!INFO] `FEAT-040` · Feature · Phase W7 · Priority: `high` · Status: `ready`

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

See [[index]] for the complete ticket list.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Feature created from browser review annotations requesting article dropdowns,
> linked hubs, and deeper prose pages. Status: `ready`.
