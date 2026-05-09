---
id: "TASK-265"
title: "Add article dropdown navigation"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040", "TASK-239"]
tags: [tickets/task, "phase/W7", website, navigation]
aliases: ["TASK-265"]
---

# Add Article Dropdown Navigation

> [!INFO] `TASK-265` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Description

Add desktop hover and keyboard-focus dropdown menus for How-To, Concepts, and
Advanced Usage so each top-level nav item links to its article subpages.

## Text Scope

- How-To dropdown links to all task article pages.
- Concepts dropdown links to all concept article pages.
- Advanced Usage dropdown links to all advanced topic pages.
- Dropdown labels use public article titles, not ticket names.
- Dropdown item descriptions may use the same short summaries as the hub cards
  if layout allows.

## Asset Scope

- No new bitmap asset required.
- Add typed navigation data that can feed topbar dropdowns, mobile navigation,
  and tests.
- Add hover, focus, and keyboard interaction tests where practical.
- Reuse route metadata so dropdown links cannot drift from article routes.

## Definition of Done

- [ ] Desktop How-To, Concepts, and Advanced Usage nav items expose article
  dropdowns on hover and focus.
- [ ] Mobile navigation keeps article links reachable without hover.
- [ ] Dropdowns are accessible by keyboard and screen-reader naming.
- [ ] Dropdowns do not include the standalone GitHub link removed from the
  header in Phase W6.
- [ ] Navigation tests and route completeness checks pass.

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser annotations requesting article dropdowns. Status:
> `open`.
