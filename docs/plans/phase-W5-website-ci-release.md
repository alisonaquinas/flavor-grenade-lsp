---
title: "Phase W5: Website CI And Pages Release"
phase: W5
status: planned
tags: [plans, website, ci, release, github-pages]
aliases: [Phase W5, Website Release]
updated: 2026-05-09
---

# Phase W5: Website CI And Pages Release

| Field | Value |
|---|---|
| Phase | W5 |
| Title | Website CI And Pages Release |
| Status | planned |
| Gate | Tag-triggered Pages deployment from `main` passes CI, ancestry guard, and release evidence checks |
| Depends on | Phase W4 |

## Objective

Integrate the website into repository CI and ship the first public GitHub Pages
release through the tag-triggered git-flow release model.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[../website/docs/requirements/technical/ci-cd]] | Implement CI, release, tag guard, and Pages deployment |
| [[../website/docs/architecture/ci-cd-and-deployment]] | Implement deployment architecture |
| [[../website/docs/requirements/technical/source-layout-and-documentation]] | Enforce docs, changelog, source, and test maturity |
| [[../website/docs/requirements/functional/seo-and-metadata]] | Verify production metadata output |

## Scope

### In Scope

- Add website CI jobs to repository workflows.
- Run website lint, typecheck, tests, build, and SEO verification in CI.
- Add tag-triggered GitHub Pages deployment.
- Add main-branch tag ancestry guard.
- Preserve website build artifacts and release evidence.
- Update changelog and release docs.

### Out of Scope

- Marketplace publishing changes.
- npm publishing changes outside website release coordination.
- New website features beyond release-readiness fixes.

## Workstreams

| Workstream | Deliverable |
|---|---|
| CI integration | Website checks on PRs, `develop`, `main`, and release tags |
| Pages release | Protected GitHub Pages deployment job |
| Release guard | Main-branch tag ancestry check |
| Evidence | Build artifacts, changelog, and release notes |

## Acceptance

- Pull requests run website checks.
- `develop` and `main` pushes run website checks.
- Production Pages deployment runs only from the selected release tag pattern.
- Production deploy verifies the tag commit is on `main`.
- Website build artifact, SEO checks, and changelog evidence are preserved.
- First release tag deploys the site successfully.

## Gate Verification

```bash
cd website
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions evidence must show the Pages deployment job passing for the
release tag before the phase can be marked complete.

## Tickets

- [[plans/phase-W5-website-ci-release/FEAT-038]]
- [[plans/phase-W5-website-ci-release/TASK-226]]
- [[plans/phase-W5-website-ci-release/TASK-227]]
- [[plans/phase-W5-website-ci-release/TASK-228]]
- [[plans/phase-W5-website-ci-release/CHORE-091]]

## Related

- [[../website/docs/requirements/technical/ci-cd]]
- [[../website/docs/architecture/ci-cd-and-deployment]]
