---
title: Server SBOM
tags:
  - requirements/technical
  - sbom
aliases:
  - Server Software Bill of Materials
---

# Server Software Bill of Materials

This high-level SBOM covers the root language server package. It tracks direct
sources, authors or maintainers, and licenses. Release automation should still
generate a machine-readable SBOM from `package.json` and `bun.lock`.

## Package Identity

| Field | Value |
|---|---|
| Package | `flavor-grenade-lsp` |
| Version | `0.5.0` |
| Source | <https://github.com/alisonaquinas/flavor-grenade-lsp> |
| Author | Alison Aquinas |
| License | Repository `LICENSE` |
| Lockfile | `bun.lock` |

## Runtime Materials

| Component | Source | Author or maintainer | License |
|---|---|---|---|
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | <https://github.com/nestjs/nest> | Kamil Mysliwiec / NestJS maintainers | MIT |
| `js-yaml` | <https://github.com/nodeca/js-yaml> | Vladimir Zapparov / nodeca maintainers | MIT |
| `@types/js-yaml` | <https://github.com/DefinitelyTyped/DefinitelyTyped> | DefinitelyTyped contributors | MIT |
| `reflect-metadata` | <https://github.com/rbuckton/reflect-metadata> | Ron Buckton | Apache-2.0 |
| `rxjs` | <https://github.com/ReactiveX/rxjs> | Ben Lesh / ReactiveX maintainers | Apache-2.0 |
| `vscode-languageserver-protocol`, `vscode-languageserver-textdocument`, `vscode-languageserver-types` | <https://github.com/microsoft/vscode-languageserver-node> | Microsoft Corporation | MIT |

## Build And Verification Materials

| Component group | Source | Author or maintainer | License |
|---|---|---|---|
| Cucumber and Jest test tooling | <https://github.com/cucumber/cucumber-js>, <https://github.com/jestjs/jest> | Cucumber and Jest maintainers | MIT |
| TypeScript and Node type tooling | <https://github.com/microsoft/TypeScript>, <https://github.com/DefinitelyTyped/DefinitelyTyped> | Microsoft Corporation / DefinitelyTyped contributors | Apache-2.0, MIT |
| ESLint and TypeScript ESLint tooling | <https://github.com/eslint/eslint>, <https://github.com/typescript-eslint/typescript-eslint> | ESLint and typescript-eslint maintainers | MIT |
| Security lint tooling | <https://github.com/eslint-community/eslint-plugin-security> | eslint-community / Node Security Project maintainers | Apache-2.0 |
| Formatting and hook tooling | <https://github.com/prettier/prettier>, <https://github.com/evilmartians/lefthook> | Prettier and Lefthook maintainers | MIT |
| OFM docs lint tooling | <https://github.com/alisonaquinas/markdownlint-obsidian> | Alison Aquinas | MIT |

## SBOM Requirement

**Tag:** Technical.SBOM.Server
**Gist:** Server releases must include current source, author, license, and
lockfile-derived dependency evidence.
**Fail:** Release evidence lacks an SBOM, the SBOM omits a direct runtime
component, or the high-level inventory disagrees with `package.json`.
**Goal:** Every server release has a generated SBOM and this high-level
inventory remains accurate for direct dependencies and tooling groups.
