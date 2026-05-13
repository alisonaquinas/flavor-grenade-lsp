---
title: Extension Markdown Flavor E2E Test Specification
tags: [extension/docs, tests, e2e, markdown-flavor]
aliases: [Extension Markdown Flavor E2E Tests]
---

# Extension Markdown Flavor E2E Test Specification

Target file: `extension/src/test/suite/markdown-flavor.test.js`.

## Test Cases

| Spec ID | Fixture | Steps | Assertions |
|---|---|---|---|
| EXT-MF-E-001 | `.obsidian/` vault fixture | Open `notes/welcome.md`. | Active document language id is `markdown`; selector shows `Auto Detect (Obsidian)`. |
| EXT-MF-E-002 | Generic Markdown fixture | Open `README.md`. | Active document language id is `markdown`; selector shows `Auto Detect (CommonMark)`; no vault indexing work starts. |
| EXT-MF-E-003 | Flavor Grenade config fixture | Select each required explicit flavor from the selector. | Setting is written to workspace scope and server refresh is observed. |
| EXT-MF-E-004 | Standalone file fixture | Open a file outside any workspace and select `Original Markdown`. | Setting is written to user scope. |
| EXT-MF-E-005 | Manual language fixture | Change active `.md` document to `plaintext` or `mdx`. | Flavor selector becomes inactive or non-applying; language id remains user-selected. |
| EXT-MF-E-006 | Auto reset fixture | Start with workspace override `gfm`, then select `Auto Detect`. | Override is cleared/reset and effective flavor recomputes from context. |

## Exit Criteria

- E2E tests prove visible behavior, not only internal state.
- Workspace and standalone persistence both pass.
- No E2E flow changes a `.md` document to a custom Markdown language id.
