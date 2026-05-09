---
id: "TASK-228"
title: "Add release evidence and production smoke checks"
type: task
status: done
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

> [!INFO] `TASK-228` · Task · Phase W5 · Parent: [[FEAT-038]] · Status: `done`

## Description

Preserve website release evidence and add smoke checks for the built production
site after deployment.

## Implementation Details

Create and wire:

- `website/tests/release-evidence.test.ts`
- `.github/workflows/website-pages.yml`
- `CHANGELOG.md`

Expected release evidence shape:

- Test website tags are accepted by the workflow for dry-run evidence but must
  skip the protected production Pages deployment.
- Workflow logs emit an explicit release mode for test and production tags.
- Smoke checks verify built homepage output, public quickstart content,
  `sitemap.xml`, `robots.txt`, and the VS Code Marketplace link.
- Release evidence is written under `website/release-evidence/` and uploaded
  as a retained artifact named `website-release-evidence`.
- The changelog records the website release workflow.

## Definition of Done

- [x] Website build artifact is retained for release runs.
- [x] Release logs distinguish test tags from production tags.
- [x] Production smoke checks verify homepage, quickstart, sitemap, robots, and
  Marketplace link.
- [x] Changelog entry records the website release.
- [x] Deployment evidence is linked from the phase workflow log.
- [x] Parent feature child row is updated.

## Linked Tests

| Test | Status | Requirement |
|---|---|---|
| `website/tests/release-evidence.test.ts` | ✅ passing | `Website.CICD.ReleaseEvidence` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/release-evidence.test.ts`, which expects release
> evidence, smoke checks, test-tag handling, and changelog coverage before the
> workflow implements them. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added release evidence retention, production-build smoke checks, test-tag
> dry-run handling, and a changelog entry. Evidence artifacts are uploaded as
> `website-dist` and `website-release-evidence` in `website-pages.yml`.
> Status: `green`.

> [!INFO] In Review · 2026-05-09
> Updated DoD and test traceability after local website lint, typecheck, and
> tests passed. Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #55 CI passed, including Website checks. Status: `done`.
