---
title: Dependency Audit Log
tags: [security, supply-chain, audit]
aliases: [Dependency Audit Log]
updated: 2026-05-23
---

# Dependency Audit Log

## 2026-05-23 — 0.4.4 / 0.2.4 Release Audit

| Scope | Command | Result |
|---|---|---|
| Root package | `bun audit` | 0 vulnerabilities |
| Extension full dependency tree | `npm audit` from `extension/` | 0 vulnerabilities |
| Website runtime dependencies | `npm audit --omit=dev` from `website/` | 0 vulnerabilities |
| Open dependency PR streams | `gh pr list --state open --json number,title,baseRefName,headRefName,statusCheckRollup --limit 20` | 0 open PRs |

Notes:

- The release branch carries the GitHub Actions cache-poisoning hardening from develop: every scanner-covered `actions/setup-node@v6` step in CI, extension release, and website Pages workflows sets `package-manager-cache: false`.
- `src/test/ci-workflow.test.ts` verifies the `setup-node` cache policy and confirms Dependabot version-update streams target `develop`.
- No dependency manifest changes were required for the audit result beyond the release version bump.

## 2026-05-08 — Phase 18 Security Hardening

| Scope | Command | Result |
|---|---|---|
| Root package | `bun audit` | 0 vulnerabilities |
| Extension runtime dependencies | `npm audit --prefix extension --omit=dev` | 0 vulnerabilities |
| Extension full dependency tree | `npm audit --prefix extension` | Found high-severity transitive `fast-uri` advisory, then 0 vulnerabilities after `npm audit fix --package-lock-only --ignore-scripts` |

Notes:

- The extension advisory was transitive through the development dependency tree.
- `npm audit fix --package-lock-only --ignore-scripts` updated the extension lockfile without changing direct dependency declarations.
- Exact dependency range linting now runs with `bun run lint:dependencies`.
