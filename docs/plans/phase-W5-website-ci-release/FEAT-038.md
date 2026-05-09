---
id: "FEAT-038"
title: "Website CI And Pages Release"
type: feature
status: in-progress
priority: high
phase: W5
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-037"]
tags: [tickets/feature, "phase/W5", website, ci]
aliases: ["FEAT-038"]
---

# Website CI And Pages Release

> [!INFO] `FEAT-038` · Feature · Phase W5 · Priority: `high` · Status: `in-progress`

## Goal

The website ships through repository CI/CD with PR checks, branch checks, and a
tag-triggered GitHub Pages release workflow guarded by `main` branch ancestry.

## Scope

**In scope:**

- Website CI jobs.
- Tag-triggered Pages deployment.
- Main-branch tag ancestry guard.
- Website build artifacts and smoke evidence.
- Changelog and release documentation updates.

**Out of scope:**

- npm publish changes unrelated to website release.
- Visual Studio Marketplace publish changes.

## Linked Requirements

| Requirement | Source |
|---|---|
| CI/CD requirements | [[../../../website/docs/requirements/technical/ci-cd]] |
| Deployment architecture | [[../../../website/docs/architecture/ci-cd-and-deployment]] |
| Source layout and documentation | [[../../../website/docs/requirements/technical/source-layout-and-documentation]] |

## Acceptance Criteria

- [ ] Pull requests run website checks.
- [ ] `develop` and `main` pushes run website checks.
- [ ] Production Pages deploy is tag triggered.
- [ ] Production deploy verifies tag commit is on `main`.
- [ ] Website artifact and release evidence are preserved.
- [ ] First website release tag deploys successfully.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-226]] | Add website CI gates | `red` |
| [[TASK-227]] | Add tag-triggered GitHub Pages deployment | `open` |
| [[TASK-228]] | Add release evidence and production smoke checks | `open` |
| [[CHORE-091]] | Phase W5 release readiness sweep | `open` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created for Phase W5 website release. Status: `ready`.

> [!INFO] Started · 2026-05-09
> Phase W5 started after Phase W4 merged in PR #54 with green CI. Status:
> `in-progress`.

> [!INFO] TASK-226 red · 2026-05-09
> TASK-226 entered `red` with failing website CI workflow coverage.
