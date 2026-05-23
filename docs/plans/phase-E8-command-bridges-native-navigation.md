---
title: "Phase E8: Command Bridges And Native Navigation"
phase: E8
status: complete
tags: [plans, vscode, extension, commands, marksman-parity]
aliases: [Phase E8, Command Bridges]
updated: 2026-05-07
---

# Phase E8: Command Bridges And Native Navigation

| Field | Value |
|---|---|
| Phase | E8 |
| Title | Command Bridges And Native Navigation |
| Status | complete |
| Gate | Bridge commands validate payloads and invoke native VS Code reference and navigation UI |
| Depends on | Phase E7 |

## Objective

Match Marksman's `showReferences` and `followLink` bridge behavior, then extend
it for OFMarkdown embed, backlink, outlink, and vault actions. Server
intelligence stays server-side; the extension only adapts safe payloads into VS
Code APIs.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.NativeUI]] | Adapt server locations to native VS Code UI commands |
| [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.PayloadValidation]] | Validate valid and invalid JSON-serializable payloads before API calls |
| [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.GraphActions]] | Register graph, embed, vault reveal, and diagnostic bridge commands |

## Scope

### In Scope

- Register `flavorGrenade.showReferences`.
- Register `flavorGrenade.followLink`.
- Register `flavorGrenade.openEmbedTarget`.
- Register `flavorGrenade.showBacklinks`.
- Register `flavorGrenade.showOutlinks`.
- Register `flavorGrenade.revealVaultRoot`.
- Add shared payload validation for locations and URI-bearing payloads.
- Keep payload contracts JSON-serializable and client-owned.

### Out of Scope

- Custom tree views or activity-bar views.
- Server-side VS Code type imports.
- Marketplace screenshots.

## Acceptance

- Valid reference payloads call `editor.action.showReferences`.
- Valid link payloads call a native location navigation API.
- Invalid payloads fail safely with no uncaught extension-host exception.
- Bridge command names are contributed and registered consistently.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

## Related

- [[docs/features/vscode-extension-parity]]
- [[docs/ddd/editor-client/domain-model]]
- [[ADR019-vscode-command-bridges-and-client-ux]]
