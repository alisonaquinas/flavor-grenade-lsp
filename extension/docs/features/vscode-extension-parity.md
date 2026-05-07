---
title: VS Code Extension Parity Feature
tags: [extension/docs, features, vscode, parity]
aliases: [Extension Feature Parity]
---

# VS Code Extension Parity Feature

The VS Code extension parity feature makes Flavor Grenade feel native in VS
Code while keeping OFMarkdown intelligence in the language server.

## Feature Surface

| Area | Requirement |
|---|---|
| Activation | Activate for `.obsidian/` and `.flavor-grenade.toml`; avoid expensive startup for generic Markdown |
| Language mode | Promote vault Markdown to `ofmarkdown`; preserve generic Markdown and manual modes |
| Commands | Register restart, rebuild, output, show references, follow link, open embed, backlinks, outlinks, reveal vault, copy diagnostics |
| Status | Show starting, indexing, ready, disabled, and error states with useful tooltips and quick actions |
| Tests | Cover activation, language mode, commands, status, and server path failures in extension-host tests |
| Marketplace | Show current OFMarkdown screenshots in README and packaged assets |
| Contributions | Add snippets and language-scoped affordances for `ofmarkdown` |

## Functional Requirement Trace

| Area | Functional requirements |
|---|---|
| Activation | `Extension.Activation.VaultPrecision`, `Extension.Activation.MarkerEvents` |
| Language mode | `Extension.LanguageMode.MembershipRefresh` |
| Commands | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.CommandBridges.GraphActions` |
| Status | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions` |
| Tests | `Extension.Tests.HostCoverage`, `Extension.Workspace.EnvironmentModes` |
| Marketplace | `Extension.Marketplace.OFMProof`, `Extension.Marketplace.AssetPackaging` |
| Contributions | `Extension.Contributions.OFMarkdownScoped` |
| Packaging | `Extension.Packaging.TargetBinaryValidation` |

## Command Bridge Contract

Command bridge payloads must be JSON-serializable and must not require server
types in the extension bundle.

Minimum payload shape:

```typescript
interface LocationPayload {
  uri: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}
```

The extension validates payload shape before calling VS Code APIs.

## Non-Goals

- No automatic server binary download.
- No web extension support in this phase.
- No server-side import of VS Code types.
- No custom tree view until command bridges and status UX are stable.
