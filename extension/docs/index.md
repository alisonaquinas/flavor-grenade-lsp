---
title: Flavor Grenade VS Code Extension Docs
tags: [extension/docs, vscode, markdown-flavor]
aliases: [Extension Docs, VS Code Extension Docs]
---

# Flavor Grenade VS Code Extension Docs

This directory contains VS Code extension-specific planning and specification
documents. Root `docs/` remains the authoritative project documentation tree;
this folder mirrors the extension client surface so extension work can be read
without scanning the server docs.

## Documents

| Document | Purpose |
|---|---|
| [features/activation-behavior.md](features/activation-behavior.md) | User-facing activation, idle startup, Markdown wake, and command wake behavior |
| [features/command-bridge-contracts.md](features/command-bridge-contracts.md) | Maintainer-facing command bridge payload contracts and safe failure behavior |
| [features/vscode-extension-parity.md](features/vscode-extension-parity.md) | User-facing VS Code extension parity feature spec |
| [features/workspace-environments.md](features/workspace-environments.md) | Workspace trust, virtual workspace, local, and remote environment behavior |
| [requirements/index.md](requirements/index.md) | Extension-local requirements layer index |
| [requirements/user/index.md](requirements/user/index.md) | Extension-local user requirements for Markdown flavor UX |
| [requirements/design/index.md](requirements/design/index.md) | Extension-local design requirements for flavor selector, status, command, and Marketplace surfaces |
| [requirements/functional/vscode-extension-parity.md](requirements/functional/vscode-extension-parity.md) | Extension-specific functional requirements |
| [requirements/technical/index.md](requirements/technical/index.md) | Extension-local technical requirement links |
| [requirements/operational/index.md](requirements/operational/index.md) | Extension-local operational requirement links |
| [ddd/editor-client-parity-model.md](ddd/editor-client-parity-model.md) | Extension client domain model additions |
| [bdd/vscode-extension-parity.feature](bdd/vscode-extension-parity.feature) | Extension parity acceptance scenarios |
| [tests/index.md](tests/index.md) | Extension-local Markdown flavor test plan |
| [tests/matrix.md](tests/matrix.md) | Extension-local requirements-to-tests matrix |
| [plans/vscode-extension-parity.md](plans/vscode-extension-parity.md) | Extension implementation plan |

## Root References

- `docs/features/vscode-extension-parity.md`
- `docs/design/markdown-flavor-auto-detection.md`
- `docs/requirements/functional/vscode-extension-parity.md`
- `docs/ddd/editor-client/domain-model.md`
- `docs/adr/ADR019-vscode-command-bridges-and-client-ux.md`
- `docs/plans/phase-E7-vscode-extension-parity.md`
- `docs/plans/phase-E7-activation-precision.md`
- `docs/plans/phase-E8-command-bridges-native-navigation.md`
- `docs/plans/phase-E9-extension-host-regression-harness.md`
- `docs/plans/phase-E10-status-ux-troubleshooting.md`
- `docs/plans/phase-E11-marketplace-evidence-packaging-proof.md`
- `docs/plans/phase-E12-ofmarkdown-editor-contributions.md`
- `docs/plans/phase-E13-workspace-environment-modes.md`
- `docs/plans/phase-E14-membership-refresh-compatibility-guardrails.md`
