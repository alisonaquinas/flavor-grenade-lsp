---
id: "FEAT-038"
title: "Website CI And Pages Release"
type: feature
status: done
priority: high
phase: W5
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-037"]
tags: [tickets/feature, "phase/W5", website, ci]
aliases: ["FEAT-038"]
---

# Website CI And Pages Release

> [!INFO] `FEAT-038` · Feature · Phase W5 · Priority: `high` · Status: `done`

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

- [x] Pull requests run website checks.
- [x] `develop` and `main` pushes run website checks.
- [x] Production Pages deploy is tag triggered.
- [x] Production deploy verifies tag commit is on `main`.
- [x] Website artifact and release evidence are preserved.
- [x] First website release tag deployment was intentionally cancelled by human
  instruction and is not required to unblock later website authoring phases.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-226]] | Add website CI gates | `done` |
| [[TASK-227]] | Add tag-triggered GitHub Pages deployment | `done` |
| [[TASK-228]] | Add release evidence and production smoke checks | `done` |
| [[CHORE-091]] | Phase W5 release readiness sweep | `cancelled` |

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

> [!CHECK] PR CI · 2026-05-09
> PR #55 CI passed. Implementation tasks moved to `done`; CHORE-091 remains
> `in-review` until release tag workflow and Pages deployment evidence exists.

> [!WARNING] BUG-029 opened · 2026-05-09
> After PR #55 merged, release planning found that website-only releases need
> `site-v*` tags so Pages can deploy without waking root npm publish automation.

> [!CHECK] BUG-029 PR CI · 2026-05-09
> PR #56 CI passed with independent website release tag support.

> [!CAUTION] Release execution cancelled · 2026-05-10
> Human instruction cancelled the actual production release tag push. W5 closes
> on implemented and CI-verified website checks, Pages workflow, ancestry guard,
> release-evidence automation, and independent `site-v*` tag support. No
> release tag was pushed and no production Pages deploy evidence is claimed.

> [!CHECK] Accepted · 2026-05-10
> W5 closeout accepted with CHORE-091 cancelled. Implementation evidence is PR
> #55 and PR #56 green CI; release execution remains intentionally absent.
> Status: `done`.

## Retrospective

> Written after W5 closeout. Date: 2026-05-10.

### What went as planned

The website CI job, Pages workflow, tag ancestry guard, and release evidence
automation were implemented with regression coverage and passed PR CI.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| BUG-028 | Bug | GitHub Actions tag filters use globs, not regex-shaped patterns. | +0.3 h |
| BUG-029 | Bug | Website-only releases needed `site-v*` tags to avoid waking root npm publish automation. | +0.3 h |
| CHORE-091 | Chore | Production release execution was cancelled by human instruction. | -0.2 h |

### Process observations

The implementation and release-execution responsibilities were mixed in one
phase. Future release phases should separate "automation implemented" from
"production release executed" when a real deployment may be intentionally
withheld.

### Carry-forward actions

- [ ] Keep production release execution as an explicit human-triggered decision.

### Rule / template amendments

- [ ] None.
