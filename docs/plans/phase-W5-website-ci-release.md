---
title: "Phase W5: Website CI And Pages Release"
phase: W5
status: complete
tags: [plans, website, ci, release, github-pages]
aliases: [Phase W5, Website Release]
updated: 2026-05-09
---

# Phase W5: Website CI And Pages Release

| Field | Value |
|---|---|
| Phase | W5 |
| Title | Website CI And Pages Release |
| Status | complete |
| Gate | Website CI and Pages release automation pass PR CI; production release execution is cancelled by human instruction |
| Depends on | Phase W4 |

## Objective

Integrate the website into repository CI and ship the first public GitHub Pages
release through the tag-triggered git-flow release model.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [requirements/technical/ci-cd](../../website/docs/requirements/operational/ci-cd.md) | Implement CI, release, tag guard, and Pages deployment |
| [architecture/ci-cd-and-deployment](../../website/docs/architecture/ci-cd-and-deployment.md) | Implement deployment architecture |
| [requirements/technical/source-layout-and-documentation](../../website/docs/requirements/technical/source-layout-and-documentation.md) | Enforce docs, changelog, source, and test maturity |
| [requirements/functional/seo-and-metadata](../../website/docs/requirements/functional/seo-and-metadata.md) | Verify production metadata output |

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
- First release tag deployment is explicitly cancelled for this closeout.

## Gate Verification

```bash
cd website
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions evidence must show the website CI and Pages workflow regression
checks passing. Production release-tag execution is not required for this
closeout because it was cancelled by human instruction.

## Tickets

- [[docs/plans/phase-W5-website-ci-release/FEAT-038]]
- [[docs/plans/phase-W5-website-ci-release/TASK-226]]
- [[docs/plans/phase-W5-website-ci-release/TASK-227]]
- [[docs/plans/phase-W5-website-ci-release/TASK-228]]
- [[docs/plans/phase-W5-website-ci-release/CHORE-091]]

## Related

- [requirements/technical/ci-cd](../../website/docs/requirements/operational/ci-cd.md)
- [architecture/ci-cd-and-deployment](../../website/docs/architecture/ci-cd-and-deployment.md)

## Workflow Log

> [!CAUTION] Release execution cancelled · 2026-05-10
> The production release tag push was cancelled by human instruction. W5 closes
> on PR #55 and PR #56 green CI for the implemented automation; no production
> Pages deployment evidence is claimed.
