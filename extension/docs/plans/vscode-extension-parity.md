---
title: VS Code Extension Parity Plan
tags: [extension/docs, plans, vscode, parity]
aliases: [Extension Parity Plan]
---

# VS Code Extension Parity Plan

## Delivery Slices

| Slice | Outcome |
|---|---|
| E7.1 Activation precision | Add vault marker activation and generic Markdown idle behavior |
| E7.2 Command bridges | Add native references, follow-link, embed, backlink, outlink, reveal, and diagnostic commands |
| E7.3 Extension tests | Add extension-host tests for activation, language mode, commands, status, and failures |
| E7.4 Status UX | Add richer tooltip, disabled states, error states, and quick actions |
| E7.5 Marketplace proof | Add screenshots and README sections for OFMarkdown behavior |
| E7.6 OFMarkdown contributions | Add snippets, scoped keybindings, and language configuration refinements |

## Gate

The phase is complete when:

- root `docs/bdd/features/vscode-extension-parity.feature` scenarios are backed
  by extension-host tests or documented manual verification
- `npm run test` passes under `extension/`
- `npm run compile` passes under `extension/`
- packaged VSIX inspection confirms required assets are present
