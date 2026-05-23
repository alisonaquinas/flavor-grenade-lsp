---
title: Operational Requirements Index
tags:
  - requirements/operational
aliases:
  - Operational Requirements
---

# Operational Requirements

Operational requirements describe release, CI, process, and supply-chain
controls that keep the project buildable, reviewable, and publishable.

Use this folder when a change affects how work is integrated, verified,
released, or published. Operational requirements are the source of truth for
branching, workflow gates, publishing safeguards, dependency update policy, and
release evidence.

## Layer Boundary

Operational requirements define process and automation contracts. They can name
GitHub Actions workflows, branch names, release tags, publishing jobs, and audit
commands. User-visible behavior belongs in
[[docs/requirements/functional/index]], while source-level implementation
constraints belong in [[docs/requirements/technical/index]].

## Maintenance Rules

- Update operational requirements in the same branch as workflow, release, or
  dependency-policy changes.
- Keep CI requirements aligned with `.github/workflows/*.yml` and
  `src/test/ci-workflow.test.ts`.
- Treat release and publishing requirements as blocking controls; document dry
  runs and tag containment checks before enabling a publish path.
- Link audit outcomes through [[docs/security/dependency-audit-log]] when the
  requirement depends on current dependency state.

## Files

| File | Scope |
|---|---|
| [[ci-cd]] | CI gates, publishing, release triggers, and pre-commit enforcement |
| [[development-process]] | Branching, testing, scripts, and binary-file process rules |
| [[security-supply-chain]] | Dependency pinning, audit review, package-cache control, and supply-chain policy |
