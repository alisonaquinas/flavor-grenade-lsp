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
| EXT-MF-I-007 | `extension/src/activation-gate.test.ts` or `extension/src/markdown-flavor.test.ts` | Inspect activation events and `LanguageClient` options. | `clientOptions.documentSelector` serves file-backed `markdown`; E16 owns cleanup of retired `onLanguage:ofmarkdown` contribution activation. |
| EXT-MF-I-008 | `extension/src/markdown-flavor.test.ts` or `extension/src/commands.test.ts` | Change selector values across every required explicit flavor while a client stub records outbound messages. | Extension sends the expected `workspace/didChangeConfiguration` or documented equivalent payload with resource-specific selected and effective flavor state. |
| EXT-MF-I-009 | `extension/src/commands.test.ts` | Selector changes while the server is unavailable, restarting, or not yet ready. | Extension stores the selected state, does not change document language id, and replays or recomputes effective flavor after server readiness. |
| EXT-MF-I-010 | `extension/src/workspace-environment.test.ts` or startup tests | Restricted, virtual, unsupported-scheme, or untrusted workspace with Markdown files and selector state. | Flavor selector state does not cause server spawn, workspace-folder setting writes, or propagation in unsupported/untrusted environments. |
| EXT-MF-I-011 | `extension/src/markdown-flavor-evidence.test.ts` and planned inference resolver tests | project-config-absent smoketest inference fixtures are opened from bounded fixture roots. | Extension detects no project config marker, passes bounded syntax/context evidence to Auto Detect, and expects strong fixtures to infer their target flavor while ambiguous fixtures remain CommonMark. |
| EXT-MF-I-012 | `extension/src/language-mode.test.ts` or startup tests | Open `extension/test-fixtures/workspaces/smoketest/README.md` as the workspace root while child fixtures and repository ancestor project config files exist. | Root README remains generic Markdown/CommonMark and does not trigger OFM membership or project-flavor propagation from child or ancestor markers. |
| EXT-MF-I-013 | `extension/src/markdown-flavor.test.ts` or planned structured-profile tests | Open Keep a Changelog, Common Changelog, and MADR fixtures from configured and project-config-absent inference smoke workspaces under multiple base flavor settings. | Extension computes structured profile flags separately from effective base flavor, propagates both to the server, never exposes structured profile ids as Markdown flavor selector choices, and keeps sibling changelog variants from enabling both changelog flags at once. |

`EXT-MF-I-006` is reserved for packaged VSIX asset proof only. Activation and
client document-selector coverage use `EXT-MF-U-014` and `EXT-MF-I-007`.

## Exit Criteria

- E15 no longer uses `ofmarkdown` in the `LanguageClient` document selector;
  E16 owns removal of retired contribution activation.
- Selector command activation is covered.
- `clientOptions.documentSelector` is verified independently from Marketplace
  asset proof.
- Real client-to-server propagation is planned for all explicit flavor ids and
  resource-specific effective flavor state.
- Server-unavailable, restricted/virtual, unsupported-scheme, and untrusted
  workspace paths keep language ids stable and avoid stale propagation or
  workspace-folder writes.
- project-config-absent inference fixtures and fixture-boundary negative controls are
  covered before host E2E relies on them.
- Structured profile fixtures prove Keep a Changelog, Common Changelog, and
  MADR can mix with configured and inferred base Markdown flavors without
  expanding the flavor list.
- Marketplace proof tests include Markdown flavor evidence in
  `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts`.
