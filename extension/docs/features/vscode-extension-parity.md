---
title: VS Code Extension Parity Feature
tags: [extension/docs, features, vscode, parity]
aliases: [Extension Feature Parity]
---

# VS Code Extension Parity Feature

The VS Code extension parity feature makes Flavor Grenade feel native in VS
Code while keeping Markdown flavor intelligence in the language server.

## Feature Surface

| Area | Requirement |
|---|---|
| Activation | Activate for `.obsidian/` and `.flavor-grenade.toml`; avoid expensive startup for generic Markdown |
| Markdown flavor | Keep `.md` files in `markdown`; expose Auto Detect and every supported researched Markdown flavor in a separate status-bar selector that reports the effective flavor |
| Commands | Register restart, rebuild, output, show references, follow link, open embed, backlinks, outlinks, reveal vault, copy diagnostics |
| Status | Show starting, indexing, ready, disabled, and error states without document counts in the status text; keep document counts in diagnostics and expose useful tooltips and quick actions |
| Tests | Cover activation, Markdown flavor selection, commands, status, and server path failures in extension-host tests |
| Marketplace | Show current Markdown flavor and OFM feature screenshots in README and packaged assets |
| Contributions | Add snippets and command affordances gated by flavor/context rather than a custom language id |

## Functional Requirement Trace

| Area | Functional requirements |
|---|---|
| Activation | `Extension.Activation.VaultPrecision`, `Extension.Activation.MarkerEvents` |
| Markdown flavor | `Extension.MarkdownFlavor.Refresh` |
| Commands | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.CommandBridges.GraphActions` |
| Status | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions` |
| Tests | `Extension.Tests.HostCoverage`, `Extension.Workspace.EnvironmentModes` |
| Marketplace | `Extension.Marketplace.OFMProof`, `Extension.Marketplace.AssetPackaging` |
| Contributions | `Extension.Contributions.FlavorScoped` |
| Packaging | `Extension.Packaging.TargetBinaryValidation` |

## Command Bridge Contract

Command bridge payloads must be JSON-serializable and must not require server
types or VS Code classes in the extension bundle.

Required Phase E8 bridge commands:

- `flavorGrenade.showReferences`
- `flavorGrenade.followLink`
- `flavorGrenade.openEmbedTarget`
- `flavorGrenade.showBacklinks`
- `flavorGrenade.showOutlinks`
- `flavorGrenade.revealVaultRoot`
- `flavorGrenade.copyDiagnosticInfo`

Minimum location payload shape:

```typescript
interface LocationPayload {
  uri: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}
```

The extension validates payload shape before calling VS Code APIs. Invalid
payloads fail safely with a command-payload error and no uncaught
extension-host exception.

Detailed payload contracts live in
[command-bridge-contracts.md](command-bridge-contracts.md). They trace to Phase
E8 and the `Extension.CommandBridges.NativeUI`,
`Extension.CommandBridges.PayloadValidation`, and
`Extension.CommandBridges.GraphActions` requirements.

Markdown flavor Auto Detect behavior follows the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md).

## Non-Goals

- No automatic server binary download.
- No web extension support in this phase.
- No server-side import of VS Code types.
- No custom tree view until command bridges and status UX are stable.
