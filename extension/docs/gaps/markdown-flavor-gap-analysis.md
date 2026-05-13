---
title: Extension Markdown Flavor Gap Analysis
tags:
  - extension/docs
  - gaps
  - markdown-flavor
aliases:
  - VS Code Markdown Flavor Gap Analysis
  - Extension Flavor Selector Gap Register
---

# Extension Markdown Flavor Gap Analysis

Date: 2026-05-13

Scope: VS Code extension code, extension package contributions, host tests,
Marketplace evidence, and extension-local test specifications.

Repository-level server and BDD gaps are summarized in
`docs/gaps/markdown-flavor-gap-analysis.md`.

## Executive Summary

The extension requirements now require `.md` files to stay in VS Code's built-in
`markdown` language mode and expose Markdown flavor through a separate selector.
The current extension still implements the earlier `ofmarkdown` language-mode
design.

This is a major behavioral gap, not a cosmetic one. The shipped application
state conflicts with `Extension.MarkdownLanguage.PreserveDefault`,
`Extension.MarkdownFlavor.Selector`, `Extension.MarkdownFlavor.RequiredCoverage`,
`Extension.MarkdownFlavor.OverridePersistence`, and
`Extension.MarkdownFlavor.ServerPropagation`.

Net state:

| Area | Current state | Gap severity |
|---|---|---|
| Language mode preservation | Fails for vault Markdown; code promotes to `ofmarkdown` | High |
| Flavor selector UI | Missing | High |
| `flavorGrenade.markdownFlavor` setting | Missing from package schema | High |
| Required flavor list | Missing from extension code and package schema | High |
| Override persistence | Missing | High |
| Server propagation | Missing | High |
| Manual non-Markdown safety | Partially present for old language controller | Medium |
| Contribution scoping | Still `ofmarkdown`-scoped | High |
| Host tests | Still expect `ofmarkdown` promotion | High |
| README/Marketplace proof | Still describes `OFMarkdown` mode | High |

## Current Application Evidence

| Evidence | Current behavior |
|---|---|
| `extension/package.json` | Contributes `ofmarkdown` language, grammar, snippets, `onLanguage:ofmarkdown`, and `editorLangId == ofmarkdown` keybindings. |
| `extension/package.json` | Does not define `flavorGrenade.markdownFlavor`. |
| `extension/src/language-mode.ts` | Defines `OFMARKDOWN_LANGUAGE_ID` and calls `setTextDocumentLanguage(..., 'ofmarkdown')` for marker/server membership. |
| `extension/src/extension.ts` | LanguageClient document selector includes both `markdown` and `ofmarkdown`. |
| `extension/src/extension.ts` | Initialization options send link style, completion limit, and diagnostic suppressions, but no flavor state. |
| `extension/src/activation-gate.ts` | `ofmarkdown` open documents can start the client. |
| `extension/src/status-bar.ts` | Status item represents server state only; it is not a Markdown flavor selector. |
| `extension/src/commands.ts` | Quick-pick exists for status actions only, not flavor choices. |
| `extension/src/test/suite/activation-language-mode.test.js` | Host test waits for `document.languageId === 'ofmarkdown'`. |
| `extension/README.md` | Describes language picker switching to `OFMarkdown`. |

## Gap Register

| Gap ID | Requirement/test source | Current state | Required state | Severity |
|---|---|---|---|---|
| GAP-E-001 | `Extension.MarkdownLanguage.PreserveDefault`; `EXT-MF-U-003`, `EXT-MF-E-001` | `LanguageModeController` promotes Markdown to `ofmarkdown`. | Flavor selection must never call `setTextDocumentLanguage` for `.md` flavor state. | High |
| GAP-E-002 | `Extension.MarkdownFlavor.Selector`; `EXT-MF-U-002`, `EXT-MF-E-001` | No selector command/status item exists. | Extension must show a Markdown flavor selector near the language control as VS Code allows. | High |
| GAP-E-003 | `Extension.MarkdownFlavor.RequiredCoverage`; `EXT-MF-U-001` | No extension flavor constants exist; package schema lacks flavor enum. | Extension must expose `auto` and all 13 explicit researched flavor ids. | High |
| GAP-E-004 | `Extension.MarkdownFlavor.AutoDetection`; `EXT-MF-U-004`, `EXT-MF-U-005` | Marker/server membership results map to language promotion, not effective flavor. | Auto detection must resolve `obsidian`, configured project flavor, or `commonmark`. | High |
| GAP-E-005 | `Extension.MarkdownFlavor.OverridePersistence`; `EXT-MF-U-006` to `EXT-MF-U-008` | No selector write path exists. | Folder-backed files write workspace-folder/workspace settings; standalone files write user settings; Auto clears same scope. | High |
| GAP-E-006 | `Extension.MarkdownFlavor.ServerPropagation`; `EXT-MF-U-009` | No flavor initialization option, config update, or metadata refresh is sent. | Effective flavor changes must reach the server and refresh open documents. | High |
| GAP-E-007 | `Extension.MarkdownFlavor.Refresh`; `EXT-MF-U-010` | Refresh triggers only re-run language promotion/demotion. | Server ready, rebuild, workspace, editor, file-open, and selector changes must recompute effective flavor. | High |
| GAP-E-008 | `Extension.MarkdownFlavor.ManualLanguageSafety`; `EXT-MF-U-011`, `EXT-MF-U-012` | Plaintext preservation is covered by old tests, but selector inactivity and MDX-as-flavor versus MDX-as-language are absent. | Non-`markdown` documents must be ignored by flavor application while `mdx` remains selectable as a flavor for Markdown documents. | Medium |
| GAP-E-009 | `Extension.Activation.MarkerEvents`; `EXT-MF-I-001` to `EXT-MF-I-003` | Activation still includes `onLanguage:ofmarkdown`; no selector command activation exists. | Startup gate should support vault signals, built-in Markdown, explicit commands, and flavor selector interaction without requiring `ofmarkdown`. | High |
| GAP-E-010 | `Extension.Contributions.FlavorScoped`; `EXT-MF-C-001` to `EXT-MF-C-004` | Snippets, language config, and keybindings are scoped to `ofmarkdown`. | Flavor-specific affordances need context keys, commands, or safe Markdown behavior without custom language id dependency. | High |
| GAP-E-011 | `Extension.Tests.HostCoverage`; `EXT-MF-E-001` to `EXT-MF-E-006` | Host suite has `activation-language-mode.test.js`; no `markdown-flavor.test.js`. | Host tests must prove selector labels, settings targets, server refresh, and language preservation. | High |
| GAP-E-012 | `Extension.Marketplace.OFMProof`; `EXT-MF-I-005`, `EXT-MF-VF-005` | README and marketplace tests require `ofmarkdown-mode.png`. | Marketplace proof must include Markdown flavor selector evidence and stop presenting language-mode promotion as current behavior. | High |
| GAP-E-013 | `Extension.MarkdownFlavor.RequiredCoverage`; `EXT-MF-VF-001` | `npm test` cannot run missing `extension/src/markdown-flavor.test.ts`. | Extension unit suite must include selector, enum/schema, auto-detection, persistence, propagation, refresh, and manual-language tests. | High |
| GAP-E-014 | `Extension.MarkdownFlavor.Selector`; `Extension.MarkdownFlavor.OverridePersistence`; `Extension.MarkdownFlavor.ManualLanguageSafety`; `Extension.MarkdownLanguage.PreserveDefault`; `EXT-MF-VA-001` to `EXT-MF-VA-004` | No screenshot/smoke record or host log validates selector behavior. | Validation evidence must show user-visible selector, correct settings scope, no `ofmarkdown` transition, and research-backed flavor display. | Medium |

## Requirement-by-Requirement Status

| Requirement | Status | Notes |
|---|---|---|
| `Extension.MarkdownLanguage.PreserveDefault` | Failing | Current code intentionally changes language id to `ofmarkdown`. |
| `Extension.MarkdownFlavor.Selector` | Missing | No selector item or command exists. |
| `Extension.MarkdownFlavor.RequiredCoverage` | Missing | Required ids are only in docs, not extension code or schema. |
| `Extension.MarkdownFlavor.DialectProfiles` | Missing in extension | Extension has no profile display/source model; server also lacks registry. |
| `Extension.MarkdownFlavor.AutoDetection` | Partial input only | Marker and membership inputs exist, but output is language mode, not effective flavor. |
| `Extension.MarkdownFlavor.OverridePersistence` | Missing | No setting and no `ConfigurationTarget` write path. |
| `Extension.MarkdownFlavor.ServerPropagation` | Missing | LanguageClient does not send effective flavor. |
| `Extension.MarkdownFlavor.ManualLanguageSafety` | Partial | Old controller preserves some non-managed languages; new selector behavior is unimplemented. |
| `Extension.MarkdownFlavor.Refresh` | Wrong model | Refresh exists for promotion/demotion, not flavor state. |
| `Extension.Contributions.FlavorScoped` | Failing | Contributions depend on `editorLangId == ofmarkdown`. |

## Test Specification Gap

| Test level | Spec file | Current implementation gap |
|---|---|---|
| Unit | `extension/docs/tests/markdown-flavor-unit-spec.md` | `extension/src/markdown-flavor.test.ts` does not exist; contribution tests still assert `ofmarkdown` scope. |
| Integration | `extension/docs/tests/markdown-flavor-integration-spec.md` | Activation tests still include `ofmarkdown`; selector command activation and marketplace selector proof are missing. |
| E2E | `extension/docs/tests/markdown-flavor-e2e-spec.md` | `extension/src/test/suite/markdown-flavor.test.js` does not exist; host suite still waits for `ofmarkdown`. |
| Verification | `extension/docs/tests/markdown-flavor-verification-spec.md` | `npm test` and `npm run test:host` run existing suites, but the required flavor tests are absent. |
| Validation | `extension/docs/tests/markdown-flavor-validation-spec.md` | No selector screenshot, settings-scope smoke record, host log, or research-backed display review exists. |

## Required Extension Work

| Step | Work |
|---|---|
| 1 | Replace `LanguageModeController` with `MarkdownFlavorController`; do not call `vscode.languages.setTextDocumentLanguage` for flavor; track `languageId` and `effectiveFlavor` separately; ignore non-`markdown` documents. |
| 2 | Add an extension flavor model with required ids, labels, display order, `auto`, explicit flavors, and source/profile metadata or server-backed profile lookup. |
| 3 | Add `flavorGrenade.markdownFlavor` to package configuration with ADR020 enum values, default `auto`, and clear project/user scope descriptions. |
| 4 | Add selector UI through a status item or equivalent command, quick-pick choices, `Auto Detect (EffectiveFlavor)` display, and disabled/inactive behavior for non-Markdown documents. |
| 5 | Implement override persistence to workspace-folder/workspace scope for folder-owned documents, user scope for standalone files, and same-scope reset for Auto. |
| 6 | Propagate effective flavor to the server through initialization options, configuration changes, or a documented metadata path, then refresh diagnostics/features for open Markdown documents. |
| 7 | Update activation so it removes primary dependency on `onLanguage:ofmarkdown`, adds selector command activation, and keeps generic Markdown idle unless command, selector, or vault signal requires work. |
| 8 | Rewrite contribution scoping to remove `ofmarkdown` language dependency where possible and use context keys or explicit commands for flavor-specific affordances. |
| 9 | Replace tests by adding `extension/src/markdown-flavor.test.ts`, adding `extension/src/test/suite/markdown-flavor.test.js`, rewriting contribution tests, and updating marketplace asset tests. |
| 10 | Update user-facing app docs, including `extension/README.md`, troubleshooting, activation docs, and Marketplace assets. |

## Reusable Pieces

| Current code | Reuse path |
|---|---|
| `hasOfMarkdownMarkerAncestor` / marker detection helpers | Rename/rework as flavor detection helpers for Obsidian and Flavor Grenade workspaces. |
| `DocumentMembershipService` request path | Keep as optional auto-detection evidence, but return or map to effective flavor instead of language id. |
| Status bar infrastructure | Can host or complement the Markdown flavor selector. |
| Status quick-pick command pattern | Can inform flavor quick-pick implementation, but should be separate from status actions. |
| Manual-language preservation tests | Can be adapted to assert selector inactivity for `plaintext` and `mdx` language ids. |
| Host fixture runner | Can add `markdown-flavor.test.js` without replacing the whole host harness. |

## Closure Criteria

The extension gap is closed when:

- `extension/package.json` no longer needs `ofmarkdown` as the primary flavor
  mechanism;
- opening an Obsidian vault `.md` file leaves `document.languageId` as
  `markdown`;
- selector choices include every required flavor id and label;
- `flavorGrenade.markdownFlavor` persists at the correct scope;
- selecting every explicit flavor refreshes server analysis;
- `mdx` language mode is preserved while `mdx` flavor remains selectable for
  Markdown documents;
- contribution tests no longer assert `editorLangId == ofmarkdown`;
- host tests prove visible selector behavior, settings scope, and no custom
  language id transition;
- Marketplace README and asset tests show current Markdown flavor behavior.
