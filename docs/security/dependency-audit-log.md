---
title: Dependency Audit Log
tags: [security, supply-chain, audit]
aliases: [Dependency Audit Log]
updated: 2026-05-08
---

# Dependency Audit Log

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
