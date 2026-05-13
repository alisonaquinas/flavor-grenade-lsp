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

Remove current activation and contribution dependencies on `ofmarkdown`
language-scope behavior and update user-facing proof so the Marketplace
presents current Markdown flavor behavior instead of historical language-mode
promotion.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]] | Add selector activation and remove current `onLanguage:ofmarkdown` activation dependency |
| [[requirements/functional/vscode-extension-parity#Extension.Contributions.FlavorScoped]] | Scope snippets, keybindings, and commands by flavor/context |
| [[requirements/functional/vscode-extension-parity#Extension.Marketplace.OFMProof]] | Show Markdown flavor selector proof |
| [[requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]] | Keep referenced assets packaged |
| [GAP-E-010](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close stale contribution scoping gap |
| [GAP-E-012](../../extension/docs/gaps/markdown-flavor-gap-analysis.md) | Close Marketplace language-mode proof gap |

## Scope

### In Scope

- Activation updates for selector command and built-in Markdown behavior.
- Contribution tests rewritten from `ofmarkdown` scope to flavor/context scope.
- Snippet/keybinding/language-configuration migration or retirement.
- README and troubleshooting updates.
- Marketplace selector visual evidence and packaging tests in
  `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts`.

### Out of Scope

- Core selector implementation, which belongs to E15.
- Host e2e verification, which belongs to E17.

## Acceptance

- No contribution test requires `editorLangId == ofmarkdown` as the primary
  flavor scoping mechanism.
- Current activation does not depend on `onLanguage:ofmarkdown`; any legacy
  mention is non-authoritative historical context only.
- `LanguageClient` `clientOptions.documentSelector` is file-backed `markdown`
  only, and tests fail if `ofmarkdown` remains in the current selector.
- Generic CommonMark Markdown does not receive Obsidian-only affordances.
- Marketplace README shows Markdown flavor selector behavior, covered by
  `extension/test/marketplace/readme-assets.test.ts`.
- Packaged VSIX includes every referenced Marketplace asset, covered by
  `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts`.

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
- [extension Markdown flavor gap analysis](../../extension/docs/gaps/markdown-flavor-gap-analysis.md)
