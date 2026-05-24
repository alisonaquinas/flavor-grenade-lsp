---
title: Extension SBOM
tags:
  - extension/docs
  - requirements/technical
  - sbom
aliases:
  - Extension Software Bill of Materials
---

# Extension Software Bill of Materials

This high-level SBOM covers the VS Code extension package. It tracks direct
sources, authors or maintainers, and licenses. Release automation should still
generate a machine-readable SBOM from `extension/package.json` and
`extension/package-lock.json`.

## Package Identity

| Field | Value |
|---|---|
| Package | `flavor-grenade-lsp` |
| Version | `0.3.0` |
| Publisher | `alisonaquinas` |
| Source | <https://github.com/alisonaquinas/flavor-grenade-lsp> |
| Author | Alison Aquinas |
| License | MIT |
| Lockfile | `extension/package-lock.json` |

## Runtime Materials

| Component | Source | Author or maintainer | License |
|---|---|---|---|
| `vscode-languageclient` | <https://github.com/microsoft/vscode-languageserver-node> | Microsoft Corporation | MIT |
| Bundled language server module | <https://github.com/alisonaquinas/flavor-grenade-lsp> | Alison Aquinas | Repository `LICENSE` |

## Build And Verification Materials

| Component group | Source | Author or maintainer | License |
|---|---|---|---|
| VS Code API and host test tooling | <https://github.com/DefinitelyTyped/DefinitelyTyped>, <https://github.com/microsoft/vscode-test> | DefinitelyTyped contributors / Visual Studio Code Team | MIT |
| VSIX packaging tooling | <https://github.com/microsoft/vscode-vsce> | Microsoft Corporation | MIT |
| Bundling and TypeScript execution | <https://github.com/evanw/esbuild>, <https://github.com/privatenumber/tsx> | Evan Wallace / Hiroki Osame | MIT |
| TypeScript | <https://github.com/microsoft/TypeScript> | Microsoft Corporation | Apache-2.0 |

## SBOM Requirement

**Tag:** Technical.SBOM.Extension
**Gist:** Extension releases must include current source, author, license,
VSIX payload, and lockfile-derived dependency evidence.
**Fail:** Release evidence lacks an SBOM, the SBOM omits the runtime language
client or bundled server module, or this inventory disagrees with
`extension/package.json`.
**Goal:** Every extension release has a generated SBOM and this high-level
inventory remains accurate for direct dependencies, bundled payloads, and
tooling groups.
