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
| EXT-MF-VA-001 | Selector screenshot or manual smoke record | User can identify the effective Markdown flavor without using VS Code's language picker. |
| EXT-MF-VA-002 | Settings inspection | Workspace-folder and user settings are written at the expected scope for override flows. |
| EXT-MF-VA-003 | Host test log | No call changes a Markdown document to `ofmarkdown` or another custom Markdown language id. |
| EXT-MF-VA-004 | Review against `docs/research/` | Every displayed flavor has a source-backed profile and no unresearched flavor is exposed. |

## Exit Criteria

- Product review validates selector behavior in VS Code.
- Screenshots or smoke records show Markdown flavor behavior.
- Review evidence confirms the extension does not retcon language mode state.
