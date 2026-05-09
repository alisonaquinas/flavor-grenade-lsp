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
| [[TASK-226]] | Add website CI gates | `in-review` |
| [[TASK-227]] | Add tag-triggered GitHub Pages deployment | `in-review` |
| [[TASK-228]] | Add release evidence and production smoke checks | `in-review` |
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

> [!SUCCESS] TASK-226 green · 2026-05-09
> TASK-226 added the website CI gate and build artifact upload.

> [!INFO] TASK-227 red · 2026-05-09
> TASK-227 entered `red` with failing Pages workflow coverage.

> [!SUCCESS] TASK-227 green · 2026-05-09
> TASK-227 added the tag-triggered GitHub Pages deployment workflow.

> [!INFO] TASK-228 red · 2026-05-09
> TASK-228 entered `red` with failing release evidence workflow coverage.

> [!SUCCESS] TASK-228 green · 2026-05-09
> TASK-228 preserved `website-dist` and `website-release-evidence`, added
> production-build smoke checks, and separated test-tag dry runs from
> production deploys.

> [!INFO] TASKS in review · 2026-05-09
> TASK-226, TASK-227, and TASK-228 moved to `in-review` after local W5 website
> checks passed and traceability was updated.

> [!WARNING] BUG-028 opened · 2026-05-09
> CHORE-091 found that the website release trigger used a regex-shaped GitHub
> Actions tag filter. BUG-028 was opened and triaged before fixing the workflow.
