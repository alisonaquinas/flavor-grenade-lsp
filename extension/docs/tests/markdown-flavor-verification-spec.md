---
title: Extension Markdown Flavor Verification Test Specification
tags: [extension/docs, tests, verification, markdown-flavor]
aliases: [Extension Markdown Flavor Verification Tests]
---

# Extension Markdown Flavor Verification Test Specification

Verification proves extension test commands and CI gates include flavor tests.

## Test Cases

| Spec ID | Command or file | Assertions |
|---|---|---|
| EXT-MF-VF-001 | `npm test` from `extension/` | Runs `markdown-flavor.test.ts` and updated contribution tests. |
| EXT-MF-VF-002 | `npm run compile` from `extension/` | TypeScript accepts flavor ids, selector model, and command wiring. |
| EXT-MF-VF-003 | `npm run test:host` from `extension/` | Runs `markdown-flavor.test.js` in the VS Code Extension Development Host. |
| EXT-MF-VF-004 | `.github/workflows/ci.yml` | CI includes extension unit and host tests after flavor tests are added. |
| EXT-MF-VF-005 | `npm run verify:marketplace-assets` | Marketplace asset verification includes Markdown flavor selector proof. |

## Exit Criteria

- Local extension commands fail if flavor tests are missing.
- CI runs extension unit and host flavor tests.
- Marketplace asset verification covers selector proof.
