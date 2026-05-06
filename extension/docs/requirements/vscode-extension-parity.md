---
title: VS Code Extension Parity Requirements
tags: [extension/docs, requirements, vscode, parity]
aliases: [Extension Parity Functional Requirements]
---

# VS Code Extension Parity Requirements

## Requirement Table

| Tag | Gist |
|---|---|
| Extension.Activation.VaultPrecision | Activate for vaults and stay lightweight for generic Markdown |
| Extension.CommandBridges.NativeUI | Bridge server payloads to native VS Code UI commands |
| Extension.Tests.HostCoverage | Cover extension behavior with extension-host tests |
| Extension.Marketplace.OFMProof | Show OFMarkdown behavior with Marketplace visuals |
| Extension.Status.Diagnostics | Expose actionable server and vault state through status UI |
| Extension.Activation.MarkerEvents | React to vault markers, language activation, and explicit commands |
| Extension.CommandBridges.PayloadValidation | Validate JSON-serializable bridge payloads before VS Code API calls |
| Extension.CommandBridges.GraphActions | Bridge references, links, embeds, graph actions, vault reveal, and diagnostic copy actions |
| Extension.Status.QuickActions | Expose restart, rebuild, output, diagnostics, and reveal actions from status UI |
| Extension.LanguageMode.MembershipRefresh | Refresh `ofmarkdown` membership after server and workspace events |
| Extension.Workspace.EnvironmentModes | Define behavior for restricted, virtual, remote, WSL, SSH, and Dev Container workspaces |
| Extension.Contributions.OFMarkdownScoped | Scope snippets, keybindings, language config, and themes to `ofmarkdown` |
| Extension.Marketplace.AssetPackaging | Include referenced Marketplace proof assets in packaged VSIX output |

Root requirement definitions live in
`docs/requirements/vscode-extension-parity.md`.

## Verification Commands

Planned verification commands:

```powershell
Set-Location extension
npm run test
npm run compile
npm exec vsce package -- --no-dependencies
```

The packaged VSIX must include extension docs or Marketplace assets only when
explicitly allowed by `.vscodeignore`.
