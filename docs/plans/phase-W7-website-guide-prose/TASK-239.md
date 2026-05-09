---
id: "TASK-239"
title: "Build linked article hub pages"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, navigation, hubs]
aliases: ["TASK-239"]
---

# Build Linked Article Hub Pages

> [!INFO] `TASK-239` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Description

Convert How-To, Concepts, and Advanced Usage hub pages from static prose lists
into linked article indexes.

## Text Scope

- How-To hub intro: setup-first task selection and workflow groups.
- Concepts hub intro: LLM wiki concept map and maintainer use.
- Advanced Usage hub intro: deep topic selection for configuration, indexing,
  safety, parser behavior, and compatibility.
- Hub entries use article titles, one-line summaries, and short reader outcomes.
- Hub copy stays crawlable as ordinary links and does not require hover to
  discover article routes.

## Asset Scope

- No new bitmap asset required.
- Add reusable article-list rendering for hub pages.
- Add tests for hub link lists.
- Reuse the article metadata needed by dropdown navigation and sitemap checks.

## Definition of Done

- [ ] How-To, Concepts, and Advanced Usage hubs render linked article lists.
- [ ] Hub entries include article summaries and reader outcomes.
- [ ] Mobile remains usable without hover.
- [ ] Content tests pass.

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created for linked article hub pages. Status: `in-review`.
