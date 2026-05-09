---
id: "TASK-227"
title: "Add tag-triggered GitHub Pages deployment"
type: task
status: open
priority: high
phase: W5
parent: "FEAT-038"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-226"]
tags: [tickets/task, "phase/W5", website, github-pages]
aliases: ["TASK-227"]
---

# Add Tag-Triggered GitHub Pages Deployment

> [!INFO] `TASK-227` · Task · Phase W5 · Parent: [[FEAT-038]] · Status: `open`

## Description

Add the production GitHub Pages deployment workflow. Deployment must run only
from release tags whose commits are contained in `origin/main`.

## Definition of Done

- [ ] Production Pages deployment is tag triggered.
- [ ] Workflow verifies the tag SHA is contained in `origin/main`.
- [ ] Workflow uses minimal Pages permissions.
- [ ] Workflow uses a protected Pages environment.
- [ ] Workflow uses concurrency for production deploys.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.
