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
