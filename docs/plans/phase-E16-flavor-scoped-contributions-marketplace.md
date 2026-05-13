---
title: "Phase E16: Flavor-Scoped Contributions And Marketplace"
phase: E16
status: planned
tags: [plans, vscode, extension, markdown-flavor, marketplace]
aliases: [Phase E16, Flavor-Scoped Contributions]
updated: 2026-05-13
---

# Phase E16: Flavor-Scoped Contributions And Marketplace

| Field | Value |
|---|---|
| Phase | E16 |
| Title | Flavor-Scoped Contributions And Marketplace |
| Status | planned |
| Gate | Extension contributions and Marketplace proof align with Markdown flavor selection |
| Depends on | Phase E15 |

## Objective

Remove the primary dependency on `ofmarkdown` language-scope contributions and
update user-facing proof so the Marketplace presents current Markdown flavor
behavior instead of historical language-mode promotion.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]] | Add selector activation and remove primary `ofmarkdown` dependency |
| [[requirements/functional/vscode-extension-parity#Extension.Contributions.FlavorScoped]] | Scope snippets, keybindings, and commands by flavor/context |
| [[requirements/functional/vscode-extension-parity#Extension.Marketplace.OFMProof]] | Show Markdown flavor selector proof |
| [[requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]] | Keep referenced assets packaged |
| [[extension/docs/gaps/markdown-flavor-gap-analysis#GAP-E-010]] | Close stale contribution scoping gap |
| [[extension/docs/gaps/markdown-flavor-gap-analysis#GAP-E-012]] | Close Marketplace language-mode proof gap |

## Scope

### In Scope

- Activation updates for selector command and built-in Markdown behavior.
- Contribution tests rewritten from `ofmarkdown` scope to flavor/context scope.
- Snippet/keybinding/language-configuration migration or retirement.
- README and troubleshooting updates.
- Marketplace selector visual evidence and packaging tests.

### Out of Scope

- Core selector implementation, which belongs to E15.
- Host e2e verification, which belongs to E17.

## Acceptance

- No contribution test requires `editorLangId == ofmarkdown` as the primary
  flavor scoping mechanism.
- Generic CommonMark Markdown does not receive Obsidian-only affordances.
- Marketplace README shows Markdown flavor selector behavior.
- Packaged VSIX includes every referenced Marketplace asset.

## Gate Verification

```bash
cd extension
npm test
npm run verify:marketplace-assets
npm run compile
```

## Tickets

Ticket index: [[plans/phase-E16-flavor-scoped-contributions-marketplace/index]]

## Related

- [[plans/phase-E15-markdown-flavor-selector-settings]]
- [[extension/docs/gaps/markdown-flavor-gap-analysis]]
