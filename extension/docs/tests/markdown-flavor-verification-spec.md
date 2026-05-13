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
| EXT-MF-VF-001 | `npm test` from `extension/` | Runs `extension/src/markdown-flavor.test.ts` and updated contribution tests. |
| EXT-MF-VF-002 | `npm run compile` from `extension/` | TypeScript accepts flavor ids, selector model, and command wiring. |
| EXT-MF-VF-003 | `npm run test:host` from `extension/` | Runs `extension/src/test/suite/markdown-flavor.test.js` in the VS Code Extension Development Host. |
| EXT-MF-VF-004 | `.github/workflows/ci.yml` | CI includes extension unit and host tests after flavor tests are added. |
| EXT-MF-VF-005 | `npm run verify:marketplace-assets` | Marketplace asset verification runs exact files `extension/test/marketplace/readme-assets.test.ts` and `extension/test/marketplace/vsix-assets.test.ts`. Markdown flavor selector proof is owned by [TASK-309](../../../docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309.md) and must stay covered by that command. |
| EXT-MF-VF-006 | `bun run lint:docs` from the repository root | Root docs lint includes `extension/docs/**/*.md` so extension test specs are lint-gated. |

## Exit Criteria

- Local extension commands fail if flavor tests are missing.
- CI runs extension unit and host flavor tests.
- Marketplace asset verification covers selector proof through E16/TASK-309.
- Extension docs are included in the root Markdown lint gate.
