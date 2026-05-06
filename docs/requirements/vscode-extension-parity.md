---
title: VS Code Extension Parity Requirements
tags:
  - requirements/vscode-extension-parity
aliases:
  - Extension Parity Requirements
  - Marksman VSCode Requirements
---

# VS Code Extension Parity Requirements

Scope: These requirements govern the VS Code client roadmap derived from
[[research/marksman-vscode-feature-parity-ofmarkdown]]. Server-side language
intelligence remains governed by the OFMarkdown feature requirements.

---

**Tag:** Extension.Activation.VaultPrecision
**User Req:** User.Extension.StartOnlyForVaults
**Gist:** The extension must activate automatically for Obsidian and Flavor Grenade vaults while avoiding unnecessary work in generic Markdown workspaces.
**Ambition:** Users should get immediate OFMarkdown support in vaults, but opening a random README should not make the extension feel invasive.
**Scale:** Percentage of activation test workspaces where the extension enters the expected active or idle state.
**Meter:**

1. Open a workspace containing `.obsidian/`.
2. Verify the extension activates and starts membership detection.
3. Open a workspace containing `.flavor-grenade.toml`.
4. Verify the extension activates and starts membership detection.
5. Open a generic Markdown workspace with neither marker.
6. Verify the extension remains idle until a command or supported language activation requires it.
7. Compute: (correct activation outcomes / total workspaces tested) x 100.
**Fail:** Any vault workspace fails to activate, or generic Markdown startup performs vault indexing without a positive signal.
**Goal:** 100% correct activation outcomes.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[ADR019-vscode-command-bridges-and-client-ux]].

---

**Tag:** Extension.CommandBridges.NativeUI
**User Req:** User.Extension.UseNativeVSCodeActions
**Gist:** Server-provided reference and navigation payloads must be bridgeable to native VS Code UI commands.
**Ambition:** References, link following, embeds, backlinks, and outlinks should feel like first-party VS Code actions instead of raw protocol data.
**Scale:** Percentage of registered command bridges that accept JSON-serializable payloads and invoke the expected VS Code command or API.
**Meter:**

1. Start the extension in an extension-host test workspace.
2. Register test payloads for show references, follow link, open embed target, backlinks, and outlinks.
3. Invoke each `flavorGrenade.*` command bridge.
4. Verify the expected VS Code command or API call is observed.
5. Verify invalid payloads produce a user-visible error or no-op, not an exception.
6. Compute: (passing command bridge cases / total command bridge cases) x 100.
**Fail:** Any bridge throws uncaught exceptions or accepts non-serializable payloads.
**Goal:** 100% bridge command coverage.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR019-vscode-command-bridges-and-client-ux]], [[features/vscode-extension-parity]].

---

**Tag:** Extension.Tests.HostCoverage
**User Req:** User.Extension.TrustExtensionBehavior
**Gist:** Extension-host tests must cover activation, commands, status, and language-mode behavior.
**Ambition:** Client integration is fragile because it depends on VS Code APIs, extension-host lifecycle, and child-process state. Automated tests should catch regressions before publishing.
**Scale:** Percentage of required extension-host behavior groups with at least one automated test.
**Meter:**

1. Inspect the extension test suite.
2. Verify at least one test exists for activation in `.obsidian/`, activation in `.flavor-grenade.toml`, generic Markdown isolation, OFMarkdown promotion, command registration, status transition, and missing server path failure.
3. Run the extension-host test command in CI or locally.
4. Compute: (behavior groups with passing tests / required behavior groups) x 100.
**Fail:** Any required behavior group lacks a passing test.
**Goal:** 100% required behavior group coverage.
**Stakeholders:** Extension maintainers, release managers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[requirements/ofmarkdown-language-mode]].

---

**Tag:** Extension.Marketplace.OFMProof
**User Req:** User.Extension.EvaluateBeforeInstall
**Gist:** The Marketplace README must show OFMarkdown-specific features with current screenshots or GIFs.
**Ambition:** Users should understand the OFMarkdown value proposition before installing the extension.
**Scale:** Percentage of required Marketplace feature visuals present and referenced from the extension README.
**Meter:**

1. Inspect `extension/README.md` and packaged Marketplace assets.
2. Verify visuals exist for OFMarkdown mode, wiki-link completion, heading/block completion, embeds, tags, callouts, code lens, and status.
3. Verify assets are PNG/JPEG/GIF as permitted by Marketplace rules and are included in the VSIX.
4. Compute: (present required visuals / total required visuals) x 100.
**Fail:** Fewer than 75% of required visuals present, or any referenced asset missing from the VSIX.
**Goal:** 100% required visuals present.
**Stakeholders:** Prospective users, publisher, maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[research/vscode-extension-publishing]].

---

**Tag:** Extension.Status.Diagnostics
**User Req:** User.Extension.UnderstandServerState
**Gist:** The status bar must expose actionable server, vault, and error state.
**Ambition:** Users should be able to tell whether the server is indexing, ready, disabled, crashed, or misconfigured without reading raw logs first.
**Scale:** Percentage of server lifecycle states represented by status bar text, tooltip data, and at least one relevant quick action.
**Meter:**

1. Simulate initializing, indexing, ready, error, missing binary, restricted workspace, and virtual workspace states.
2. Inspect the status bar item text and tooltip for each state.
3. Invoke available quick actions from the status item or command palette.
4. Verify each state has accurate text, useful detail, and a next action.
5. Compute: (states with complete status behavior / total states tested) x 100.
**Fail:** Any error or disabled state lacks user-visible status.
**Goal:** 100% status coverage for known states.
**Stakeholders:** VS Code users, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[ddd/editor-client/domain-model]].
