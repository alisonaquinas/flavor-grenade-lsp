---
title: Extension Markdown Flavor Validation Test Specification
tags: [extension/docs, tests, validation, markdown-flavor]
aliases: [Extension Markdown Flavor Validation Tests]
---

# Extension Markdown Flavor Validation Test Specification

Validation proves the extension behavior matches user-facing product intent.

## Test Cases

| Spec ID | Evidence | Acceptance criteria |
|---|---|---|
| EXT-MF-VA-001 | `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md` | User can identify the effective Markdown flavor without using VS Code's language picker. |
| EXT-MF-VA-002 | `extension/docs/tests/evidence/markdown-flavor-settings-scope.md` | Workspace-folder and user settings are written at the expected scope for override flows. |
| EXT-MF-VA-003 | `extension/docs/tests/evidence/markdown-flavor-host-log.md` | No call changes a Markdown document to `ofmarkdown` or another custom Markdown language id. |
| EXT-MF-VA-004 | `extension/docs/tests/evidence/markdown-flavor-research-review.md` | Every displayed flavor has a source-backed profile and no unresearched flavor is exposed. |

## Required Evidence Artifacts

| Artifact path | Required content |
|---|---|
| `extension/docs/tests/evidence/markdown-flavor-selector-smoke.md` | Screenshot path or manual smoke notes showing the selector next to Markdown language state and all required flavor labels. |
| `extension/docs/tests/evidence/markdown-flavor-settings-scope.md` | Settings inspection for workspace-folder/workspace override, standalone user override, and Auto Detect reset. |
| `extension/docs/tests/evidence/markdown-flavor-host-log.md` | `npm run test:host` log excerpt proving selector choices do not change `languageId` away from `markdown`. |
| `extension/docs/tests/evidence/markdown-flavor-research-review.md` | Displayed flavor id and label table traced to `docs/research/` or `docs/ofm-spec/`. |

## Exit Criteria

- Product review validates selector behavior in VS Code.
- Screenshots or smoke records show Markdown flavor behavior.
- Review evidence confirms the extension does not retcon language mode state.
- Evidence artifacts exist at the paths above before validation rows move from
  planned/failing to passing.
