---
title: Feature - VS Code Extension Parity
tags: [features/, vscode, extension, marksman-parity]
aliases: [VS Code Extension Parity, Marksman VSCode Parity]
---

# Feature - VS Code Extension Parity

This feature specification turns the Marksman VSCode parity research into the
client-side roadmap for Flavor Grenade's VS Code extension.

The extension stays thin. It owns VS Code integration, command registration,
status UI, Markdown flavor selection, Marketplace presentation, and tests. It
does not own Markdown parsing intelligence.

## Functional Requirement Trace

| Feature area | Functional requirements |
|---|---|
| Activation precision | [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.VaultPrecision]], [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]] |
| Command bridges | [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.NativeUI]], [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.PayloadValidation]], [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.GraphActions]] |
| Extension-host tests | [[docs/requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]] |
| Marketplace evidence | [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.OFMProof]], [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]] |
| Status and quick actions | [[docs/requirements/functional/vscode-extension-parity#Extension.Status.Diagnostics]], [[docs/requirements/functional/vscode-extension-parity#Extension.Status.QuickActions]] |
| Markdown flavor selector and editor contributions | [[docs/requirements/functional/vscode-extension-parity#Extension.Contributions.FlavorScoped]], [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]] |
| Workspace environments | [[docs/requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]] |
| Packaging guardrails | [[docs/requirements/functional/vscode-extension-parity#Extension.Packaging.TargetBinaryValidation]] |

## P1 - Activation Precision

The extension should activate for likely Obsidian/Flavor Grenade workspaces without requiring
the user to open an arbitrary Markdown file first.

Activation signals:

- `workspaceContains:.obsidian`
- `workspaceContains:.flavor-grenade.toml`
- `onLanguage:markdown`
- explicit Flavor Grenade commands

The extension should remain idle for generic Markdown workspaces until there is
a positive vault signal or the user invokes a command.

## P1 - Command Bridges

The extension should register VS Code command bridges for server-provided
locations and graph actions.

Command bridge candidates:

| Command | Purpose |
|---|---|
| `flavorGrenade.showReferences` | Adapt server locations to `editor.action.showReferences` |
| `flavorGrenade.followLink` | Open a resolved target through VS Code location UI |
| `flavorGrenade.openEmbedTarget` | Open a note, image, PDF, or media file referenced by an embed |
| `flavorGrenade.showBacklinks` | Show inbound links for the current note |
| `flavorGrenade.showOutlinks` | Show outbound links for the current note |
| `flavorGrenade.revealVaultRoot` | Reveal the active vault root in the file explorer |
| `flavorGrenade.copyDiagnosticInfo` | Copy version, platform, server path, vault state, and last error |

All command payloads must be JSON-serializable.

## P1 - Extension Host Tests

The extension needs tests that run inside the VS Code extension host.

Required coverage:

- activation in `.obsidian/` workspaces
- activation in `.flavor-grenade.toml` workspaces
- generic Markdown remains `markdown`
- vault Markdown remains `markdown` and auto-detects Obsidian flavor
- users can override flavor to any supported researched Markdown flavor
- restart, rebuild-index, show-output, and bridge commands are registered
- status bar transitions can be observed with a test server or mock client
- missing custom server path produces a useful failure state

## P1 - Marketplace Evidence

The Marketplace README should show Markdown flavor and OFM-specific value in the first
viewport and screenshots.

Required screenshots:

- Markdown flavor selector
- wiki-link completion
- heading and block-anchor completion
- embed diagnostics and hover
- tag completion and tag hover
- callout completion
- reference code lens
- status bar indexing state

## P2 - Rich Status And Quick Actions

The status bar item should expose more than a doc count.

Tooltip data:

- server state
- server version
- extension version
- active vault root
- vault count
- document count
- last error

Quick actions:

- restart server
- rebuild index
- show output
- copy diagnostic info
- reveal vault root

## P2 - Markdown Flavor Editor Contributions

Use Markdown flavor/context keys for editor affordances that should not affect
generic Markdown.

Candidates:

- snippets for callouts, embeds, wiki-links, aliases, tags, and block anchors
- language-specific keybindings for rebuild index, backlinks, and outlinks
- language configuration tuned for wiki-links and tags
- optional semantic-token theme examples

## P2 - Workspace Trust, Remote, And Virtual Workspace Behavior

The extension should explicitly handle environments where the bundled server can
or cannot run.

Required behaviors:

- Restricted Mode shows disabled status and does not spawn the server.
- Virtual workspaces show disabled status and do not spawn the server.
- WSL, SSH, and Dev Container smoke tests are documented.
- Remote extension hosts run the platform-specific binary next to the files.

## P2 - Markdown Flavor Refresh

The MarkdownFlavorController must re-evaluate effective flavor after:

- server status reaches ready
- rebuild index completes
- workspace folders change
- visible editors change
- a file is opened
- the user changes the flavor selector

It must keep `.md` documents in the built-in `markdown` language mode. Auto
detection resolves `.obsidian/` vault notes to Obsidian and generic Markdown to
CommonMark unless project/user settings override the flavor.

## Related

- [[docs/research/marksman-vscode-feature-parity-ofmarkdown]]
- [[ADR019-vscode-command-bridges-and-client-ux]]
- [[docs/requirements/functional/vscode-extension-parity]]
- [[docs/features/ofmarkdown-language-mode]]
- [[docs/ddd/editor-client/domain-model]]
- `extension/docs/index.md`
