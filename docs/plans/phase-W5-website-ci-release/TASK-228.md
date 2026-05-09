---
id: "TASK-228"
title: "Add release evidence and production smoke checks"
type: task
status: open
priority: medium
phase: W5
parent: "FEAT-038"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-226", "TASK-227"]
tags: [tickets/task, "phase/W5", website, release]
aliases: ["TASK-228"]
---

# Add Release Evidence And Production Smoke Checks

> [!INFO] `TASK-228` · Task · Phase W5 · Parent: [[FEAT-038]] · Status: `open`

## Description

Preserve website release evidence and add smoke checks for the built production
site after deployment.

## Definition of Done

- [ ] Website build artifact is retained for release runs.
- [ ] Release logs distinguish test tags from production tags.
- [ ] Production smoke checks verify homepage, quickstart, sitemap, robots, and
  Marketplace link.
- [ ] Changelog entry records the website release.
- [ ] Deployment evidence is linked from the phase workflow log.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.
