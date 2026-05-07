---
title: VS Code Extension Parity Functional Requirements
tags:
  - extension/docs
  - requirements/functional/vscode-extension-parity
aliases:
  - Extension Parity Requirements
  - Extension Parity Functional Requirements
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

---

## Implementation-Level Functional Requirements

The following Planguage requirements refine the client-side parity goal into
extension implementation capabilities.

---

**Tag:** Extension.Activation.MarkerEvents
**User Req:** User.Extension.StartOnlyForVaults
**Gist:** The extension manifest and activation controller must react to `.obsidian/`, `.flavor-grenade.toml`, `markdown`, `ofmarkdown`, and explicit command activation signals.
**Ambition:** Vault users should get automatic startup, while generic Markdown users should not pay for vault work without a positive signal.
**Scale:** Percentage of activation-signal fixtures that produce the expected active or idle state.
**Meter:**

1. Run extension-host fixtures for `.obsidian/`, `.flavor-grenade.toml`, generic Markdown, `ofmarkdown`, and explicit command activation.
2. Observe whether the extension activates.
3. Observe whether vault membership detection starts.
4. Verify generic Markdown remains idle until a command or vault signal exists.
5. Compute: (correct activation outcomes / total activation fixtures) x 100.
**Fail:** Any vault signal fails to activate the extension, or generic Markdown startup performs vault indexing work.
**Goal:** 100% activation-signal correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[requirements/ofmarkdown-language-mode]], `docs/plans/phase-E7-activation-precision.md`.

---

**Tag:** Extension.CommandBridges.PayloadValidation
**User Req:** User.Extension.UseNativeVSCodeActions
**Gist:** Command bridges must validate JSON-serializable payloads before calling VS Code APIs.
**Ambition:** Server-provided payloads and command invocations should fail safely instead of throwing extension-host exceptions.
**Scale:** Percentage of valid and invalid payload cases that produce the expected VS Code call or safe failure state.
**Meter:**

1. Register command bridges in an extension-host test.
2. Invoke each bridge with valid payloads.
3. Invoke each bridge with malformed, missing, and non-serializable payload data.
4. Verify valid payloads call the expected VS Code API.
5. Verify invalid payloads produce a user-visible error or no-op without an uncaught exception.
6. Compute: (correct payload outcomes / total payload cases) x 100.
**Fail:** Any invalid payload throws uncaught, or any valid payload is rejected.
**Goal:** 100% payload validation correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR019-vscode-command-bridges-and-client-ux]], [[features/vscode-extension-parity]], `extension/docs/features/vscode-extension-parity.md`.

---

**Tag:** Extension.CommandBridges.GraphActions
**User Req:** User.Extension.UseNativeVSCodeActions
**Gist:** The extension must bridge references, link following, embed opening, backlinks, outlinks, vault reveal, and diagnostic copy actions to native VS Code surfaces.
**Ambition:** Server intelligence should appear through familiar VS Code UI affordances without moving language intelligence into the client.
**Scale:** Percentage of required `flavorGrenade.*` bridge commands registered and mapped to the expected native VS Code action.
**Meter:**

1. Start the extension host.
2. Inspect registered commands.
3. Invoke show references, follow link, open embed target, show backlinks, show outlinks, reveal vault root, and copy diagnostic info.
4. Verify each command calls the expected VS Code command or API with validated payload data.
5. Compute: (correct bridge implementations / total required bridge commands) x 100.
**Fail:** Any required bridge command is missing or calls the wrong UI surface.
**Goal:** 100% required bridge command coverage.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ADR019-vscode-command-bridges-and-client-ux]], [[features/vscode-extension-parity]], [[ddd/editor-client/domain-model]].

---

**Tag:** Extension.Status.QuickActions
**User Req:** User.Extension.UnderstandServerState
**Gist:** Status UI must expose restart, rebuild index, show output, copy diagnostics, and reveal vault root actions when applicable.
**Ambition:** Users should recover from common server and vault problems from the status surface instead of searching logs.
**Scale:** Percentage of server states with accurate text, tooltip data, and applicable quick actions.
**Meter:**

1. Simulate starting, indexing, ready, disabled, missing binary, error, restricted, and virtual workspace states.
2. Inspect status item text and tooltip.
3. Invoke quick actions offered for each state.
4. Verify unavailable actions are hidden or disabled.
5. Compute: (states with correct status and actions / total states) x 100.
**Fail:** Any error or disabled state lacks an actionable status path.
**Goal:** 100% known-state status coverage.
**Stakeholders:** VS Code users, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[ddd/editor-client/domain-model]], `extension/docs/plans/vscode-extension-parity.md`.

---

**Tag:** Extension.LanguageMode.MembershipRefresh
**User Req:** User.Extension.TrustExtensionBehavior
**Gist:** Language-mode membership must refresh after server readiness, index rebuild, workspace folder changes, visible editor changes, and file open events.
**Ambition:** Documents should enter and leave `ofmarkdown` mode as vault membership changes without requiring window reloads.
**Scale:** Percentage of membership refresh triggers that produce correct `markdown` or `ofmarkdown` assignment.
**Meter:**

1. Open vault and non-vault Markdown documents.
2. Simulate server ready, index rebuild, workspace folder add/remove, visible editor change, and file open events.
3. Observe language mode assignments after each trigger.
4. Verify manual non-Markdown language selections are not overwritten.
5. Compute: (correct membership assignments / total trigger cases) x 100.
**Fail:** Any qualifying vault Markdown document remains generic after refresh, or any non-vault/manual document is incorrectly promoted.
**Goal:** 100% membership refresh correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/ofmarkdown-language-mode]], [[features/vscode-extension-parity]], `extension/docs/features/vscode-extension-parity.md`.

---

**Tag:** Extension.Workspace.EnvironmentModes
**User Req:** User.Extension.UnderstandServerState
**Gist:** Restricted, virtual, remote, WSL, SSH, and Dev Container workspaces must have explicit server-start behavior and documentation.
**Ambition:** The extension should fail predictably in unsupported environments and run the correct bundled server where supported.
**Scale:** Percentage of environment modes with documented and tested or manually verified behavior.
**Meter:**

1. Inspect workspace-trust and virtual-workspace handling.
2. Inspect documented remote, WSL, SSH, and Dev Container smoke-test procedures.
3. Run available automated or manual checks.
4. Verify unsupported modes show disabled status and do not spawn the server.
5. Verify supported remote modes resolve the correct platform-specific binary.
6. Compute: (environment modes with correct behavior / total environment modes) x 100.
**Fail:** Any unsupported environment spawns the server, or any supported remote mode lacks documented verification.
**Goal:** 100% explicit behavior for listed environment modes.
**Stakeholders:** VS Code users, release managers, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[requirements/functional/vscode-extension-parity]], `extension/docs/plans/vscode-extension-parity.md`.

---

**Tag:** Extension.Contributions.OFMarkdownScoped
**User Req:** User.Extension.UseNativeVSCodeActions
**Gist:** Snippets, keybindings, language configuration, and optional theme examples must be scoped to `ofmarkdown` where they would affect generic Markdown.
**Ambition:** OFMarkdown users should get richer editor affordances without surprising users editing ordinary Markdown.
**Scale:** Percentage of extension contributions scoped to the intended language or command context.
**Meter:**

1. Inspect `package.json` contributions for snippets, keybindings, language configuration, and theme examples.
2. Verify OFMarkdown-only contributions use `ofmarkdown` language scopes or command preconditions.
3. Open generic Markdown and OFMarkdown documents.
4. Verify contributions appear only in intended contexts.
5. Compute: (correctly scoped contributions / total OFMarkdown contributions) x 100.
**Fail:** Any OFMarkdown-only contribution changes generic Markdown behavior without explicit intent.
**Goal:** 100% contribution scoping correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/vscode-extension-parity]], [[features/ofmarkdown-language-mode]], [[ADR019-vscode-command-bridges-and-client-ux]].

---

**Tag:** Extension.Marketplace.AssetPackaging
**User Req:** User.Extension.EvaluateBeforeInstall
**Gist:** Marketplace screenshots and README assets must be referenced by the extension README and included in packaged VSIX output.
**Ambition:** Marketplace proof should not disappear at publish time because assets were ignored or misreferenced.
**Scale:** Percentage of required visual assets present in the repository, referenced from README, and included in VSIX packaging.
**Meter:**

1. Inspect `extension/README.md` for required OFMarkdown visuals.
2. Inspect referenced asset files.
3. Package the VSIX.
4. Inspect packaged contents.
5. Verify every referenced required asset is included and uses a Marketplace-supported format.
6. Compute: (packaged required assets / total required assets) x 100.
**Fail:** Any referenced required asset is missing from the packaged VSIX.
**Goal:** 100% required asset packaging correctness.
**Stakeholders:** Prospective users, publisher, release managers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/functional/vscode-extension-parity]], [[features/vscode-extension-parity]], [[research/vscode-extension-publishing]].
