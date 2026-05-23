---
title: Extension Technical Requirements Index
tags:
  - extension/docs
  - requirements/technical
aliases:
  - Extension Technical Requirements
---

# Extension Technical Requirements

The extension currently uses repository-level technical requirements for code
quality, validation, and configuration behavior:

## Scope

Extension technical requirements cover the client package manifest, dependency
inventory, build output shape, bundled server payload, TypeScript boundaries,
and compatibility with VS Code extension-host constraints. Root technical
requirements apply unless this folder narrows them for extension packaging.

## Evidence

Technical evidence comes from `npm run compile`, `npm test`,
`npm run verify:package-targets`, `npm run verify:marketplace-assets`, and the
root CI workflow checks that inspect the extension manifest and installed
packages. The SBOM captures high-level dependency source, author, and license
expectations for release review.

## Files

- [Repository code-quality requirements](../../../../docs/requirements/technical/code-quality.md)
- [Repository configuration requirements](../../../../docs/requirements/technical/configuration.md)
- [Repository input-validation requirements](../../../../docs/requirements/technical/security-input-validation.md)
- [[sbom]] — extension software bill of materials and SBOM release requirements
