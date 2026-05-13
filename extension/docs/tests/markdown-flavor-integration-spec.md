---
title: Extension Markdown Flavor Integration Test Specification
tags: [extension/docs, tests, integration, markdown-flavor]
aliases: [Extension Markdown Flavor Integration Tests]
---

# Extension Markdown Flavor Integration Test Specification

Integration tests cover extension wiring without requiring full user UI flows.

## Test Cases

| Spec ID | Target file | Setup | Assertions |
|---|---|---|---|
| EXT-MF-I-001 | `extension/src/activation-gate.test.ts` | Workspace with `.obsidian/`. | Extension wakes and prepares flavor detection without custom language id activation. |
| EXT-MF-I-002 | `extension/src/activation-gate.test.ts` | Workspace with generic Markdown only. | Extension remains idle until command or selector interaction requires it. |
| EXT-MF-I-003 | `extension/src/activation-gate.test.ts` | User invokes flavor selector command. | Extension wakes enough to show selector and resolve settings target. |
| EXT-MF-I-004 | `extension/src/commands.test.ts` | Rebuild index completes after selector override. | Refresh path recomputes effective flavor for open Markdown editors. |
| EXT-MF-I-005 | `extension/test/marketplace/readme-assets.test.ts` | Inspect README assets. | Markdown flavor selector proof is present alongside OFM feature proof. |
| EXT-MF-I-006 | `extension/test/marketplace/vsix-assets.test.ts` | Inspect packaged VSIX output. | Markdown flavor selector proof assets referenced by the README are included in the package. |

## Exit Criteria

- Extension startup gates no longer require `onLanguage:ofmarkdown`.
- Selector command activation is covered.
- Marketplace proof tests include Markdown flavor evidence in
  `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts`.
