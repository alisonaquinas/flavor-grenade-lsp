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

## Definition of Done

- [ ] Existing public content can be regenerated from Markdown and manifests.
- [ ] No route disappears from the sitemap.
- [ ] Existing regression phrases remain covered by tests unless intentionally
  replaced in the same commit.
- [ ] Article hubs still list the expected articles and summaries.
