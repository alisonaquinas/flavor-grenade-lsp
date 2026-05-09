---
id: "TASK-227"
title: "Add tag-triggered GitHub Pages deployment"
type: task
status: done
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

> [!INFO] `TASK-227` · Task · Phase W5 · Parent: [[FEAT-038]] · Status: `done`

## Description

Add the production GitHub Pages deployment workflow. Deployment must run only
from release tags whose commits are contained in `origin/main`.

## Implementation Details

Create and wire:

- `.github/workflows/website-pages.yml`
- `website/tests/pages-workflow.test.ts`

Expected workflow shape:

- Release tag trigger for production tags.
- Main-branch ancestry guard using `git merge-base --is-ancestor`.
- Minimal Pages permissions: `pages: write`, `id-token: write`, `contents: read`.
- Protected `github-pages` environment and deployment concurrency.
- Build with `WEBSITE_BASE=/flavor-grenade-lsp/` and deploy via GitHub Pages
  official actions.

## Definition of Done

- [x] Production Pages deployment is tag triggered.
- [x] Workflow verifies the tag SHA is contained in `origin/main`.
- [x] Workflow uses minimal Pages permissions.
- [x] Workflow uses a protected Pages environment.
- [x] Workflow uses concurrency for production deploys.
- [x] Parent feature child row is updated.

## Linked Tests

| Test | Status | Requirement |
|---|---|---|
| `website/tests/pages-workflow.test.ts` | ✅ passing | `Website.CICD.PagesDeployment` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/pages-workflow.test.ts`, which expects a Pages workflow
> before it exists. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added tag-triggered `website-pages.yml` with main ancestry guard, minimal
> Pages permissions, protected environment, concurrency, and official Pages
> deployment actions. Status: `green`.

> [!INFO] In Review · 2026-05-09
> Updated DoD and test traceability after local website lint, typecheck, and
> tests passed. Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #55 CI passed, including Website checks. Status: `done`.
