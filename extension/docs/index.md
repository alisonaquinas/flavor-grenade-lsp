---
title: Flavor Grenade VS Code Extension Docs
tags: [extension/docs, vscode, ofmarkdown]
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
| [features/vscode-extension-parity.md](features/vscode-extension-parity.md) | User-facing VS Code extension parity feature spec |
| [requirements/vscode-extension-parity.md](requirements/vscode-extension-parity.md) | Extension-specific functional requirements |
| [ddd/editor-client-parity-model.md](ddd/editor-client-parity-model.md) | Extension client domain model additions |
| [bdd/vscode-extension-parity.feature](bdd/vscode-extension-parity.feature) | Extension parity acceptance scenarios |
| [plans/vscode-extension-parity.md](plans/vscode-extension-parity.md) | Extension implementation plan |

## Root References

- `docs/features/vscode-extension-parity.md`
- `docs/requirements/vscode-extension-parity.md`
- `docs/ddd/editor-client/domain-model.md`
- `docs/adr/ADR019-vscode-command-bridges-and-client-ux.md`
- `docs/plans/phase-E7-vscode-extension-parity.md`
