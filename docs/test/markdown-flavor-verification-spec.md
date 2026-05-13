---
title: Markdown Flavor Verification Test Specification
tags:
  - test/spec
  - verification
  - markdown-flavor
aliases:
  - Markdown Flavor Verification Tests
---

# Markdown Flavor Verification Test Specification

Verification proves the required checks are wired into local and CI gates.

## Test Cases

| Spec ID | Evidence | Assertions |
|---|---|---|
| MF-VF-001 | `.github/workflows/ci.yml` and `src/test/ci-workflow.test.ts` | CI runs unit tests, BDD, extension tests, extension host tests, docs lint, typecheck, and build. Docs lint includes exact OFM globs for `docs/**/*.md`, `website/docs/**/*.md`, and `extension/docs/**/*.md`. |
| MF-VF-002 | `cucumber.yaml` | Default BDD gate includes `docs/bdd/features/ofmarkdown-language-mode.feature` and `docs/bdd/features/markdown-flavor-dialects.feature`. |
| MF-VF-003 | `docs/test/matrix.md` | Every `Extension.MarkdownFlavor.*` tag has planned or implemented evidence and honest status. |
| MF-VF-004 | Markdown lint commands | `docs/**/*.md` and `extension/docs/**/*.md` lint cleanly after test-plan changes. |
| MF-VF-005 | `src/test/ci-workflow.test.ts` | Gate-removal checks protect exact flavor feature files, root flavor spec files, extension flavor spec files, and the extension marketplace selector-proof handoff through E16/TASK-309. |

## Exit Criteria

- Local verification commands fail if flavor tests are removed.
- CI includes every relevant test layer once implementation tests exist.
- Docs traceability remains current with the implemented test files.
- Extension docs stay inside a Markdown lint gate.
