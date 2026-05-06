---
title: "Phase E7: VS Code Extension Parity"
phase: E7
status: planned
tags: [plans, vscode, extension, marksman-parity]
aliases: [Phase E7, VS Code Extension Parity]
updated: 2026-05-06
---

# Phase E7: VS Code Extension Parity

| Field | Value |
|---|---|
| Phase | E7 |
| Title | VS Code Extension Parity |
| Status | planned |
| Gate | Extension activation, command bridges, status UX, Marketplace proof, and extension-host tests satisfy parity requirements |
| Depends on | Extension Phase E6 |

## Objective

Deliver the P1 and P2 client-side parity items from
[[research/marksman-vscode-feature-parity-ofmarkdown]] while keeping all
language intelligence in the server.

## Scope

### In Scope

- Vault-marker activation events
- Command bridges for native VS Code reference and navigation UI
- Extension-host tests for activation, language mode, commands, status, and
  failure states
- Marketplace README screenshots for OFMarkdown features
- Rich status tooltip and quick actions
- OFMarkdown snippets and language-scoped contributions
- Workspace trust, virtual workspace, and remote behavior documentation
- Membership refresh after server readiness and workspace changes

### Out of Scope

- Web extension support
- Tree views or activity-bar views
- Automatic server binary download
- Server-side language intelligence

## Workstreams

| Workstream | Deliverable | Primary docs |
|---|---|---|
| Activation | Precise vault-marker activation and idle generic Markdown behavior | [[features/vscode-extension-parity]] |
| Command bridges | `flavorGrenade.showReferences`, `followLink`, `openEmbedTarget`, graph commands | [[ADR019-vscode-command-bridges-and-client-ux]] |
| Tests | VS Code extension-host tests for client behavior | [[requirements/vscode-extension-parity]] |
| Status | Rich status tooltip and quick actions | [[ddd/editor-client/domain-model]] |
| Marketplace | OFMarkdown feature screenshots in extension README | [[research/vscode-extension-publishing]] |
| Contributions | OFMarkdown snippets, keybindings, and language configuration | [[features/ofmarkdown-language-mode]] |

## Acceptance

- `docs/bdd/features/vscode-extension-parity.feature` scenarios pass or are
  mirrored by extension-host tests under `extension/`.
- `extension/docs/bdd/vscode-extension-parity.feature` stays aligned with the
  root BDD scenarios.
- Generic Markdown workspaces remain lightweight.
- VS Code-specific command bridges do not leak into server domain models.
- Marketplace assets are included in packaged VSIXs.

## Related

- [[features/vscode-extension-parity]]
- [[requirements/vscode-extension-parity]]
- [[ADR019-vscode-command-bridges-and-client-ux]]
- `extension/docs/index.md`
