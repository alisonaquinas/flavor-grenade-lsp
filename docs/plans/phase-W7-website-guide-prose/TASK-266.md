---
id: "TASK-266"
title: "Update sitemap and route metadata for guide articles"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, sitemap, seo]
aliases: ["TASK-266"]
---

# Update Sitemap And Route Metadata For Guide Articles

> [!INFO] `TASK-266` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Description

Ensure every Phase W7 article route is present in the static sitemap and has
route metadata suitable for GitHub Pages discovery and SEO.

## Text Scope

- Add sitemap coverage for every How-To, Concepts, and Advanced Usage article.
- Add route metadata for title, description, canonical path, and article group.
- Confirm hub pages link to article routes in a crawlable way.

## Asset Scope

- No new visual asset required.
- Add or update generated sitemap fixture/output.
- Add tests or checks that compare route data against sitemap entries.

## Definition of Done

- [ ] Sitemap includes all Phase W7 article routes.
- [ ] Article routes include title, description, canonical path, and section
  metadata.
- [ ] Sitemap and route metadata tests fail if a new article route is omitted.
- [ ] Build output contains expected sitemap entries.

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from request to include sitemap updates. Status: `open`.

