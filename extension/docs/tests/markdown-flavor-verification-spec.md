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
| EXT-MF-VF-001 | `npm test` from `extension/` | Runs `extension/src/markdown-flavor.test.ts`, `extension/src/markdown-flavor-evidence.test.ts`, and updated contribution tests. |
| EXT-MF-VF-002 | `npm run compile` from `extension/` | TypeScript accepts flavor ids, selector model, and command wiring. |
| EXT-MF-VF-003 | `npm run test:host` from `extension/` | Runs `extension/src/test/suite/markdown-flavor.test.js` in the VS Code Extension Development Host. |
| EXT-MF-VF-004 | `.github/workflows/ci.yml` | CI includes extension unit and host tests after flavor tests are added. |
| EXT-MF-VF-005 | `npm run verify:marketplace-assets` | Marketplace asset verification runs exact files `extension/test/marketplace/readme-assets.test.ts` and `extension/test/marketplace/vsix-assets.test.ts`. Markdown flavor selector proof is owned by [TASK-309](../../../docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309.md) and must stay covered by that command. |
| EXT-MF-VF-006 | `bun run lint:docs` from the repository root | Root docs lint includes `extension/docs/**/*.md` so extension test specs are lint-gated. |
| EXT-MF-VF-007 | `npm run verify:package-targets` from `extension/` | Package verification runs `extension/test/package-targets/server-binary.test.ts` and proves the VSIX contains exactly one bundled server module and no native server executable payload. |
| EXT-MF-VF-008 | `.github/workflows/ci.yml`, `src/test/ci-workflow.test.ts` | CI either runs `npm run test:host` for the Markdown flavor host suite or fails unless a dated blocker and replacement host evidence path are present. |
| EXT-MF-VF-009 | stale expectation scan | Current extension tests, package activation, client selectors, README/Marketplace proof, and host waits do not assert `ofmarkdown` language promotion; historical docs may mention it only as retired context. |
| EXT-MF-VF-010 | fixture inventory and host suite checks | CI/local gates protect configured smoketest fixtures, TOML-absent inference fixtures, ambiguous fallback fixtures, and root README boundary-negative behavior from silent removal. |
| EXT-MF-VF-011 | structured profile fixture inventory checks | CI/local gates protect Keep a Changelog, Common Changelog, and MADR fixture inventory under every configured and TOML-absent inference smoke workspace. |

## CI Host Gate Rule

Host coverage is a hard gate. Acceptable verification is either:

1. CI runs the Markdown flavor Extension Development Host suite; or
2. CI runs a detector that fails when host proof is missing, unless a dated
   blocker and replacement evidence artifact are committed.

Local-only host proof is not enough for release signoff unless the blocker path
is present and linked from `extension/docs/tests/evidence/`.

## Exit Criteria

- Local extension commands fail if flavor tests are missing.
- CI runs extension unit and host flavor tests.
- Marketplace asset verification covers selector proof through E16/TASK-309.
- Package target verification is part of local and release gates.
- Extension docs are included in the root Markdown lint gate.
- Stale `ofmarkdown` language-promotion expectations are rejected from current
  tests and package/client activation paths.
- Smoketest inference fixture inventory and root README boundary checks are
  protected by local or CI gates.
- Structured profile fixture inventory for both changelog variants and MADR is
  protected by local or CI gates.
