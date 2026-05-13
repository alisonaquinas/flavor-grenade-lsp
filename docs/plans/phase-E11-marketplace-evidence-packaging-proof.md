---
title: "Phase E11: Marketplace Evidence And Packaging Proof"
phase: E11
status: complete
tags: [plans, vscode, extension, marketplace, packaging]
aliases: [Phase E11, Marketplace Proof]
updated: 2026-05-07
---

# Phase E11: Marketplace Evidence And Packaging Proof

| Field | Value |
|---|---|
| Phase | E11 |
| Title | Marketplace Evidence And Packaging Proof |
| Status | complete |
| Gate | Required OFMarkdown visuals are present, referenced, and included in packaged VSIXs |
| Depends on | Phase E10 |

## Objective

Match Marksman's screenshot-backed Marketplace confidence with current
OFMarkdown-specific proof. The extension README should show the value before
installation, and packaging checks should prove those assets ship.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.OFMProof]] | Add required OFMarkdown screenshots or GIFs to the README |
| [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]] | Verify referenced assets are included in packaged VSIX output |

## Scope

### In Scope

- Add visuals for OFMarkdown language mode promotion.
- Add visuals for wiki-link, heading, and block-anchor completion.
- Add visuals for embed diagnostics and hover.
- Add visuals for tag completion or tag references.
- Add visuals for callout completion, reference code lens, and status indexing.
- Add package inspection for referenced README assets.

### Out of Scope

- Rebranding or publisher identity changes.
- Runtime server behavior.
- Non-Marketplace website work.

## Acceptance

- At least the required visual categories exist in `extension/README.md`.
- Referenced assets use Marketplace-supported formats.
- Packaged VSIX inspection confirms every referenced required asset ships.

## Gate Verification

```bash
cd extension
npm run build:extension
npm run verify:marketplace-assets
```

CI evidence: PR #43 passed TypeScript typecheck, ESLint, Prettier format check,
unit tests, Markdown lint, and build on 2026-05-07.

## Related

- [[docs/research/vscode-extension-publishing]]
- [[docs/features/vscode-extension-parity]]
- [[docs/research/marksman-vscode-feature-parity-ofmarkdown]]
