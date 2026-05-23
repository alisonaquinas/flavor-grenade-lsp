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
[Marksman VSCode feature parity research](../../../../docs/research/marksman-vscode-feature-parity-ofmarkdown.md). Server-side language
intelligence remains governed by the Markdown flavor and OFMarkdown feature
requirements.

---

## Extension.Activation.VaultPrecision

**Tag:** Extension.Activation.VaultPrecision
**User Req:** User.Extension.StartOnlyForVaults
**Gist:** The extension must activate automatically for Obsidian and Flavor Grenade vaults while avoiding unnecessary work in generic Markdown workspaces.
**Ambition:** Users should get immediate Obsidian flavor support in vaults, but opening a random README should not make the extension feel invasive.
**Scale:** Percentage of activation test workspaces where the extension enters the expected active or idle state.
**Meter:**

1. Open a workspace containing `.obsidian/`.
2. Verify the extension activates and starts membership detection.
3. Open a workspace containing `.flavor-grenade.toml`.
4. Verify the extension activates and starts membership detection.
5. Open a generic Markdown workspace with neither marker.
6. Verify the extension remains idle until a command, Markdown flavor selector interaction, or vault signal requires it.
7. Compute: (correct activation outcomes / total workspaces tested) x 100.
**Fail:** Any vault workspace fails to activate, or generic Markdown startup performs vault indexing without a positive signal.
**Goal:** 100% correct activation outcomes.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [ADR019](../../../../docs/adr/ADR019-vscode-command-bridges-and-client-ux.md).

---

## Extension.CommandBridges.NativeUI

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
**Source:** [ADR019](../../../../docs/adr/ADR019-vscode-command-bridges-and-client-ux.md), [VS Code extension parity](../../features/vscode-extension-parity.md).

---

## Extension.Tests.HostCoverage

**Tag:** Extension.Tests.HostCoverage
**User Req:** User.Extension.TrustExtensionBehavior
**Gist:** Extension-host tests must cover activation, commands, status, and Markdown flavor behavior.
**Ambition:** Client integration is fragile because it depends on VS Code APIs, extension-host lifecycle, and child-process state. Automated tests should catch regressions before publishing.
**Scale:** Percentage of required extension-host behavior groups with at least one automated test.
**Meter:**

1. Inspect the extension test suite.
2. Verify at least one test exists for activation in `.obsidian/`, activation in `.flavor-grenade.toml`, generic Markdown isolation, required Markdown flavor selection, command registration, status transition, and missing server path failure.
3. Run the extension-host test command in CI or locally.
4. Compute: (behavior groups with passing tests / required behavior groups) x 100.
**Fail:** Any required behavior group lacks a passing test.
**Goal:** 100% required behavior group coverage.
**Stakeholders:** Extension maintainers, release managers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md).

---

## Extension.Marketplace.OFMProof

**Tag:** Extension.Marketplace.OFMProof
**User Req:** User.Extension.EvaluateBeforeInstall
**Gist:** The Marketplace README must show OFMarkdown-specific features with current screenshots or GIFs.
**Ambition:** Users should understand the OFMarkdown value proposition before installing the extension.
**Scale:** Percentage of required Marketplace feature visuals present and referenced from the extension README.
**Meter:**

1. Inspect `extension/README.md` and packaged Marketplace assets.
2. Verify visuals exist for the Markdown flavor selector, wiki-link completion, heading/block completion, embeds, tags, callouts, code lens, and status.
3. Verify assets are PNG/JPEG/GIF as permitted by Marketplace rules and are included in the VSIX.
4. Compute: (present required visuals / total required visuals) x 100.
**Fail:** Fewer than 75% of required visuals present, or any referenced asset missing from the VSIX.
**Goal:** 100% required visuals present.
**Stakeholders:** Prospective users, publisher, maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [VS Code extension publishing research](../../../../docs/research/vscode-extension-publishing.md).

---

## Extension.Status.Diagnostics

**Tag:** Extension.Status.Diagnostics
**User Req:** User.Extension.UnderstandServerState
**Gist:** The status bar must expose actionable server, vault, and error state.
**Ambition:** Users should be able to tell whether the server is indexing, ready, disabled, crashed, or misconfigured without reading raw logs first.
**Scale:** Percentage of server lifecycle states represented by status bar text, tooltip data, and at least one relevant quick action.
**Meter:**

1. Simulate initializing, indexing, ready, error, missing binary, restricted workspace, and virtual workspace states.
2. Inspect the status bar item text and tooltip for each state, verifying the ready text does not include the document count.
3. Invoke available quick actions from the status item or command palette.
4. Verify each state has accurate text, useful detail, and a next action.
5. Compute: (states with complete status behavior / total states tested) x 100.
**Fail:** Any error or disabled state lacks user-visible status.
**Goal:** 100% status coverage for known states.
**Stakeholders:** VS Code users, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [editor client domain model](../../../../docs/ddd/editor-client/domain-model.md).

---

## Implementation-Level Functional Requirements

The following Planguage requirements refine the client-side parity goal into
extension implementation capabilities.

---

## Retired Historical Tags

The following tags remain as historical anchors for completed pre-ADR020 phase
records. They are not active gates for new work.

### Extension.LanguageMode.MembershipRefresh

**Tag:** Extension.LanguageMode.MembershipRefresh
**Status:** Retired by ADR020.
**Current Requirement:** Extension.MarkdownFlavor.Refresh.
**Note:** Historical E9/E14 plans used this tag for `ofmarkdown` promotion and
membership refresh behavior. Current work keeps `.md` documents in VS Code's
`markdown` language id and refreshes Markdown flavor state instead.

### Extension.Contributions.OFMarkdownScoped

**Tag:** Extension.Contributions.OFMarkdownScoped
**Status:** Retired by ADR020.
**Current Requirement:** Extension.Contributions.FlavorScoped.
**Note:** Historical E12 plans used this tag for `ofmarkdown` contribution
scoping. Current work scopes contribution behavior through Markdown
flavor/context state without requiring a custom Markdown language id.

---

## Extension.Activation.MarkerEvents

**Tag:** Extension.Activation.MarkerEvents
**User Req:** User.Extension.StartOnlyForVaults
**Gist:** The extension manifest and activation controller must react to `.obsidian/`, `.flavor-grenade.toml`, `markdown`, flavor selector commands, and explicit command activation signals.
**Ambition:** Vault users should get automatic startup, while generic Markdown users should not pay for vault work without a positive signal.
**Scale:** Percentage of activation-signal fixtures that produce the expected active or idle state.
**Meter:**

1. Run extension-host fixtures for `.obsidian/`, `.flavor-grenade.toml`, generic Markdown, flavor selector command activation, and explicit command activation.
2. Observe whether the extension activates.
3. Observe whether vault membership detection starts.
4. Inspect `LanguageClient` `clientOptions.documentSelector`.
5. Verify the selector includes file-backed `markdown` only for current flavor behavior and contains no `ofmarkdown` entry.
6. Verify generic Markdown remains idle until a command or vault signal exists.
7. Compute: (correct activation outcomes / total activation fixtures) x 100.
**Fail:** Any vault signal fails to activate the extension, generic Markdown startup performs vault indexing work, current activation depends on `onLanguage:ofmarkdown`, or the current document selector contains `ofmarkdown`.
**Goal:** 100% activation-signal correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md), `docs/plans/phase-E7-activation-precision.md`.

---

## Extension.CommandBridges.PayloadValidation

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
**Source:** [ADR019](../../../../docs/adr/ADR019-vscode-command-bridges-and-client-ux.md), [VS Code extension parity](../../features/vscode-extension-parity.md), `extension/docs/features/vscode-extension-parity.md`.

---

## Extension.CommandBridges.GraphActions

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
**Source:** [ADR019](../../../../docs/adr/ADR019-vscode-command-bridges-and-client-ux.md), [VS Code extension parity](../../features/vscode-extension-parity.md), [editor client domain model](../../../../docs/ddd/editor-client/domain-model.md).

---

## Extension.Status.QuickActions

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
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [editor client domain model](../../../../docs/ddd/editor-client/domain-model.md), `extension/docs/plans/vscode-extension-parity.md`.

---

## Extension.MarkdownFlavor.Refresh

**Tag:** Extension.MarkdownFlavor.Refresh
**User Req:** User.Extension.TrustExtensionBehavior
**Gist:** Markdown flavor state must refresh after server readiness, index rebuild, workspace folder changes, visible editor changes, file open events, and selector changes.
**Ambition:** Documents should receive the correct effective flavor as vault membership or user overrides change without requiring window reloads.
**Scale:** Percentage of flavor refresh triggers that produce the correct effective flavor while preserving `languageId = markdown`.
**Meter:**

1. Open vault and non-vault Markdown documents.
2. Simulate server ready, index rebuild, workspace folder add/remove, visible editor change, file open events, and selector changes across every required explicit flavor.
3. Observe effective Markdown flavor after each trigger.
4. Verify every `.md` document remains in `markdown`.
5. Verify `clientOptions.documentSelector` remains scoped to file-backed `markdown` only for current behavior.
6. Verify manual non-Markdown language selections are not treated as active Markdown flavor scope.
7. Compute: (correct flavor states / total trigger cases) x 100.
**Fail:** Any qualifying vault Markdown document remains generic after refresh, any selected override is ignored, any `.md` document is promoted to `ofmarkdown`, or the current document selector contains `ofmarkdown`.
**Goal:** 100% flavor refresh correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md), [VS Code extension parity](../../features/vscode-extension-parity.md), `extension/docs/features/vscode-extension-parity.md`.

---

## Extension.MarkdownFlavor.Selector

**Tag:** Extension.MarkdownFlavor.Selector
**User Req:** User.Extension.SelectMarkdownFlavor
**Gist:** The extension must expose a Markdown flavor selector separate from VS Code's built-in language picker while leaving the active document in VS Code's built-in `markdown` language mode.
**Ambition:** Users should be able to inspect and change the effective flavor from Flavor Grenade UI without losing normal Markdown editor integrations.
**Scale:** Percentage of supported Markdown editor contexts where the selector is available, reports the effective flavor, and changes flavor without changing `languageId`.
**Meter:**

1. Open file-backed Markdown documents in workspace-folder, workspace-only, vault, generic Markdown, and standalone-file contexts.
2. Verify a Flavor Grenade Markdown flavor selector is visible in the status bar or command-accessible without opening the VS Code language picker.
3. Select `Auto Detect` and each explicit flavor.
4. Verify the selector state changes and the active document remains `languageId = markdown`.
5. Verify the status-bar selector reports the current effective flavor for the active Markdown document.
6. Verify documents manually set to non-`markdown` language ids do not show active flavor behavior for that document.
7. Compute: (selector contexts passing / total supported Markdown contexts) x 100.
**Fail:** The user must use the VS Code language picker for flavor selection, the selector is unavailable for supported Markdown contexts, or selecting a flavor changes the document away from `markdown`.
**Goal:** 100% selector availability for supported file-backed Markdown contexts.
**Stakeholders:** VS Code users, Markdown authors, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md), [Markdown flavor selection feature](../../../../docs/features/ofmarkdown-language-mode.md), [VS Code extension parity](../../features/vscode-extension-parity.md).

---

## Extension.MarkdownFlavor.RequiredCoverage

**Tag:** Extension.MarkdownFlavor.RequiredCoverage
**User Req:** User.Extension.SelectMarkdownFlavor
**Gist:** The extension must expose `Auto Detect` and every planned Markdown flavor as selector choices while leaving the active document in VS Code's built-in `markdown` language mode.
**Ambition:** Users should be able to choose the same flavor set documented for server behavior from the VS Code client without using the VS Code language picker or losing normal Markdown editor integrations.
**Scale:** Percentage of required selector choices present with the correct id, label, and language-mode behavior.
**Meter:**

1. Open a file-backed `.md` document whose `languageId` is `markdown`.
2. Open the Flavor Grenade Markdown flavor selector.
3. Verify the selector exposes exactly the required choices in the table below.
4. Select each explicit flavor and verify `flavorGrenade.markdownFlavor` accepts the corresponding id.
5. Verify the active document remains `languageId = markdown` after each selection.
6. Verify `Auto Detect` is available as the reversible non-explicit choice.
7. Compute: (required selector choices present and valid / 14) x 100.
**Fail:** Any required flavor is missing, an unsupported flavor is exposed, the VS Code language picker is used for flavor selection, or selecting a flavor changes the document away from `markdown`.
**Goal:** 100% required selector coverage.
**Stakeholders:** VS Code users, Markdown authors, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md), [Markdown flavor selection feature](../../../../docs/features/ofmarkdown-language-mode.md), [Markdown flavor feature sets](../../../../docs/features/markdown-flavor-feature-sets.md), [VS Code extension parity](../../features/vscode-extension-parity.md).

| Setting id | Selector label | Feature set |
|---|---|---|
| `auto` | Auto Detect | [Markdown flavor selection](../../../../docs/features/ofmarkdown-language-mode.md) |
| `original` | Original Markdown | [Original Markdown flavor](../../../../docs/features/original-markdown-flavor.md) |
| `commonmark` | CommonMark | [CommonMark flavor](../../../../docs/features/commonmark-flavor.md) |
| `obsidian` | Obsidian | [Obsidian flavor](../../../../docs/features/obsidian-markdown-flavor.md) |
| `gfm` | GitHub Flavored Markdown | [GitHub Flavored Markdown flavor](../../../../docs/features/github-flavored-markdown-flavor.md) |
| `glfm` | GitLab Flavored Markdown | [GitLab Flavored Markdown flavor](../../../../docs/features/gitlab-flavored-markdown-flavor.md) |
| `pandoc` | Pandoc Markdown | [Pandoc Markdown flavor](../../../../docs/features/pandoc-markdown-flavor.md) |
| `multimarkdown` | MultiMarkdown | [MultiMarkdown flavor](../../../../docs/features/multimarkdown-flavor.md) |
| `mdx` | MDX | [MDX flavor](../../../../docs/features/mdx-flavor.md) |
| `kramdown` | kramdown | [kramdown flavor](../../../../docs/features/kramdown-flavor.md) |
| `markdown-extra` | Markdown Extra | [Markdown Extra flavor](../../../../docs/features/markdown-extra-flavor.md) |
| `r-markdown` | R Markdown | [R Markdown flavor](../../../../docs/features/r-markdown-flavor.md) |
| `reddit` | Reddit Markdown | [Reddit Markdown flavor](../../../../docs/features/reddit-markdown-flavor.md) |
| `stack-overflow` | Stack Overflow Markdown | [Stack Overflow Markdown flavor](../../../../docs/features/stack-overflow-markdown-flavor.md) |

---

## Extension.MarkdownFlavor.OverridePersistence

**Tag:** Extension.MarkdownFlavor.OverridePersistence
**User Req:** User.Extension.OverrideMarkdownFlavor
**Gist:** Markdown flavor overrides made from the extension UI must persist to folder settings when a workspace folder owns the active Markdown file and to user settings when the context is only a standalone file.
**Ambition:** The same selector should behave predictably in project and single-file contexts. Project choices belong with the folder; standalone-file choices cannot be written to a project and should follow the user.
**Scale:** Percentage of selector write and clear operations that target the correct VS Code configuration scope.
**Meter:**

1. Open a Markdown file inside a workspace folder.
2. Select each explicit flavor from the selector.
3. Verify `flavorGrenade.markdownFlavor` is written to the owning workspace folder or workspace setting, not only to user settings.
4. Select `Auto Detect`.
5. Verify the override is cleared or reset at the same folder/workspace scope.
6. Open a standalone Markdown file with no owning workspace folder.
7. Select an explicit flavor and verify `flavorGrenade.markdownFlavor` is written to user settings.
8. Select `Auto Detect` and verify the user-scope override is cleared or reset.
9. Compute: (correct configuration-scope operations / total write and clear operations) x 100.
**Fail:** A folder-backed override is written only to user settings, a standalone-file override attempts to write a project setting, `Auto Detect` clears a different scope from the explicit override scope, or the setting accepts a value outside the required flavor set.
**Goal:** 100% correct override persistence scope.
**Stakeholders:** VS Code users, teams sharing workspace settings, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md), [Markdown flavor selection feature](../../../../docs/features/ofmarkdown-language-mode.md), [VS Code extension parity](../../features/vscode-extension-parity.md).

---

## Extension.MarkdownFlavor.AutoDetection

**Tag:** Extension.MarkdownFlavor.AutoDetection
**User Req:** User.Extension.AutoDetectFlavor
**Gist:** In `auto` mode, the extension UI must display and propagate the effective Markdown flavor inferred from vault, project, workspace, and standalone-file context while allowing explicit user overrides to take precedence.
**Ambition:** Auto detection should preserve zero-config Obsidian vault behavior and conservative generic Markdown behavior, while still making the effective flavor visible enough for users to trust and override.
**Scale:** Percentage of documented editor contexts where the selector, configuration state, and server-facing flavor state agree.
**Meter:**

1. Open a Markdown document under a `.obsidian/` folder with `flavorGrenade.markdownFlavor` set to `auto`.
2. Verify the status-bar selector reports `Auto Detect` with effective flavor `obsidian`.
3. Open a Markdown document in a Flavor Grenade workspace with explicit project flavor config or workspace setting.
4. Verify `auto` resolves to that configured supported flavor id.
5. Open a standalone generic `.md` file with no vault or config signal.
6. Verify `auto` resolves to `commonmark`.
7. Override the active context to each explicit required flavor and verify the override takes precedence over auto detection until cleared.
8. Manually change a `.md` document to a non-`markdown` language id and verify flavor state is inactive for that document.
9. Compute: (correct effective-state outcomes / total documented contexts) x 100.
**Fail:** Generic Markdown is auto-detected as Obsidian without a positive signal, Obsidian vault notes fail to resolve to Obsidian in `auto`, explicit overrides are ignored, or non-`markdown` documents receive active flavor behavior.
**Goal:** 100% documented auto/effective-state correctness.
**Stakeholders:** Vault authors, Markdown authors, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [Markdown flavor auto-detection algorithm](../../../../docs/design/markdown-flavor-auto-detection.md), [Markdown flavor selection requirements](../../../../docs/requirements/ofmarkdown-language-mode.md), [Markdown flavor selection feature](../../../../docs/features/ofmarkdown-language-mode.md), [VS Code extension parity](../../features/vscode-extension-parity.md).

---

## Extension.Workspace.EnvironmentModes

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
5. Verify supported remote modes start the bundled server module in the
   workspace extension host.
6. Compute: (environment modes with correct behavior / total environment modes) x 100.
**Fail:** Any unsupported environment spawns the server, or any supported remote mode lacks documented verification.
**Goal:** 100% explicit behavior for listed environment modes.
**Stakeholders:** VS Code users, release managers, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [extension parity functional requirements](vscode-extension-parity.md), `extension/docs/plans/vscode-extension-parity.md`.

---

## Extension.Contributions.FlavorScoped

**Tag:** Extension.Contributions.FlavorScoped
**User Req:** User.Extension.UseNativeVSCodeActions
**Gist:** Snippets, keybindings, commands, and optional theme examples must be scoped by Markdown flavor/context where they would affect generic Markdown.
**Ambition:** Obsidian-flavor users should get richer editor affordances without surprising users editing ordinary Markdown.
**Scale:** Percentage of extension contributions scoped to the intended language or command context.
**Meter:**

1. Inspect `package.json` contributions for snippets, keybindings, language configuration, and theme examples.
2. Verify flavor-specific contributions use context keys, command preconditions, or selector state rather than an `ofmarkdown` language scope.
3. Open generic Markdown, CommonMark-selected, and Obsidian-selected documents.
4. Verify contributions appear only in intended contexts.
5. Compute: (correctly scoped contributions / total flavor-specific contributions) x 100.
**Fail:** Any flavor-specific contribution changes generic Markdown behavior without explicit intent.
**Goal:** 100% contribution scoping correctness.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [VS Code extension parity](../../features/vscode-extension-parity.md), [Markdown flavor selection feature](../../../../docs/features/ofmarkdown-language-mode.md), [ADR020](../../../../docs/adr/ADR020-markdown-flavor-selection.md), [ADR019](../../../../docs/adr/ADR019-vscode-command-bridges-and-client-ux.md).

---

## Extension.Marketplace.AssetPackaging

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
**Source:** [extension parity functional requirements](vscode-extension-parity.md), [VS Code extension parity](../../features/vscode-extension-parity.md), [VS Code extension publishing research](../../../../docs/research/vscode-extension-publishing.md).

---

## Extension.Packaging.ServerModuleValidation

**Tag:** Extension.Packaging.ServerModuleValidation
**User Req:** User.Extension.InstallCompatiblePackage
**Gist:** Each packaged VSIX must contain exactly one bundled server module, contain no native server executable payload, and make client/server version mismatches visible before publish or at startup.
**Ambition:** Users should not install an extension package whose bundled server cannot pass Marketplace validation or whose client and server versions are out of sync.
**Scale:** Percentage of packaged VSIX artifacts whose bundled server module, package metadata, and version metadata match the expected release manifest.
**Meter:**

1. Build the Marketplace VSIX.
2. Inspect the packaged VSIX for bundled server entries.
3. Verify exactly one `server/main.js` module is present.
4. Verify no native `server/flavor-grenade-lsp` executable is present.
5. Start or smoke-test the bundled server module in CI.
6. Query or inspect client and server version metadata.
7. Verify mismatches fail packaging checks or produce a user-visible startup warning.
8. Compute: (validated package artifacts / total package artifacts) x 100.
**Fail:** Any packaged VSIX contains zero or multiple server modules, contains a native server executable, or a client/server version mismatch is not visible before release or at startup.
**Goal:** 100% package validation.
**Stakeholders:** VS Code users, release managers, support maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [ADR015](../../../../docs/adr/ADR015-platform-specific-vsix.md), [VS Code extension parity](../../features/vscode-extension-parity.md), `docs/plans/phase-E14-membership-refresh-compatibility-guardrails.md`.

## Extension.Packaging.TargetBinaryValidation

This historical requirement tag was superseded by
[Extension.Packaging.ServerModuleValidation](#extensionpackagingservermodulevalidation)
when the extension moved from platform-specific native server binaries to a
bundled JavaScript server module. Archived plans and audits may still link to
this heading for trace continuity.
