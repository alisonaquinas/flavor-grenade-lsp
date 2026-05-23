---
title: Extension Operational Requirements Index
tags:
  - extension/docs
  - requirements/operational
aliases:
  - Extension Operational Requirements
---

# Extension Operational Requirements

The extension currently uses the repository-level operational requirements for
CI, packaging, release, and supply-chain policy:

## Scope

Extension operational requirements cover the client release path from local
verification through VSIX packaging and Marketplace publishing. They also cover
the CI checks that prevent stale manifests, missing packaged assets, incorrect
server payloads, and dependency drift between `package.json`, lockfiles, and
installed packages.

## Evidence

Operational evidence should name the workflow, local command, release tag, or
Marketplace dry run that proves the requirement. If a release is blocked by an
external Marketplace validation result, record the local package evidence and
the follow-up fix in the release branch or hotfix branch.

## Files

- [Repository CI/CD requirements](../../../../docs/requirements/operational/ci-cd.md)
- [Repository supply-chain requirements](../../../../docs/requirements/operational/security-supply-chain.md)
