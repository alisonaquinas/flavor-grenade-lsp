---
title: Extension Functional Requirements Index
tags:
  - extension/docs
  - requirements/functional
aliases:
  - Extension Functional Requirements
---

# Extension Functional Requirements

Extension functional requirements cover behavior that a VS Code user, VS Code
command, or extension-host test can observe. They include activation decisions,
language-mode handling, native command bridges, server startup, status bar
state, Markdown flavor selection, package integrity, and Marketplace proof.

## Scope

The extension functional layer is intentionally narrow. The server owns parsing,
resolution, diagnostics, and LSP semantics. The extension owns client startup,
VS Code API integration, resource-specific flavor propagation, status surfaces,
packaging behavior, and client-side safety checks.

## Evidence

Functional requirements should be backed by extension unit tests, host tests,
Marketplace/package verification scripts, or root CI workflow assertions. When a
behavior crosses the extension/server boundary, both sides should identify the
same resource URI and selected/effective flavor state.

## Files

| File | Scope |
|---|---|
| [vscode-extension-parity.md](vscode-extension-parity.md) | VS Code activation, command bridges, status, flavor selection, Marketplace proof, and package behavior |
