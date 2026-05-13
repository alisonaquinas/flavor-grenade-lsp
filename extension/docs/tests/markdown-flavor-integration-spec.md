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
| EXT-MF-I-007 | `extension/src/activation-gate.test.ts` or `extension/src/client-options.test.ts` | Inspect activation events and `LanguageClient` options. | `clientOptions.documentSelector` serves file-backed `markdown`; activation does not include `onLanguage:ofmarkdown`; stale `ofmarkdown` selectors fail the test. |
| EXT-MF-I-008 | `extension/src/markdown-flavor.test.ts` or `extension/src/commands.test.ts` | Change selector values across every required explicit flavor while a client stub records outbound messages. | Extension sends the expected `workspace/didChangeConfiguration` or documented equivalent payload with resource-specific selected and effective flavor state. |
| EXT-MF-I-009 | `extension/src/commands.test.ts` | Selector changes while the server is unavailable, restarting, or not yet ready. | Extension stores the selected state, does not change document language id, and replays or recomputes effective flavor after server readiness. |
| EXT-MF-I-010 | `extension/src/workspace-environment.test.ts` or startup tests | Restricted, virtual, unsupported-scheme, or untrusted workspace with Markdown files and selector state. | Flavor selector state does not cause server spawn, workspace-folder setting writes, or propagation in unsupported/untrusted environments. |

`EXT-MF-I-006` is reserved for packaged VSIX asset proof only. Activation and
client document-selector coverage use `EXT-MF-U-014` and `EXT-MF-I-007`.

## Exit Criteria

- Extension startup gates no longer require `onLanguage:ofmarkdown`.
- Selector command activation is covered.
- `clientOptions.documentSelector` is verified independently from Marketplace
  asset proof.
- Real client-to-server propagation is planned for all explicit flavor ids and
  resource-specific effective flavor state.
- Server-unavailable, restricted/virtual, unsupported-scheme, and untrusted
  workspace paths keep language ids stable and avoid stale propagation or
  workspace-folder writes.
- Marketplace proof tests include Markdown flavor evidence in
  `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts`.
