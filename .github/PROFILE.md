# Flavor Grenade LSP

[![CI](https://github.com/alisonaquinas/flavor-grenade-lsp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/alisonaquinas/flavor-grenade-lsp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/flavor-grenade-lsp)](https://www.npmjs.com/package/flavor-grenade-lsp)
[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/alisonaquinas.flavor-grenade-lsp)](https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

> [!TIP]
> Use Flavor Grenade LSP when your Markdown is an Obsidian vault, not just a
> folder of plain Markdown files.

## Project Snapshot

| Area | Current status |
|---|---|
| Server release metadata | `0.4.2` |
| VS Code extension metadata | `0.2.2` |
| Primary integration branch | `develop` |
| Release branch target | `main` |
| Package publish target | npm with trusted publishing |

## Capability Summary

- OFM-aware parsing for wiki-links, embeds, block anchors, callouts, tags,
  frontmatter, Markdown links, Markdown images, and reference labels.
- Navigation features for definitions, references, backlinks, document links,
  symbols, highlights, folding, selection ranges, and semantic tokens.
- Editing features for completions, rename, file-operation planning, and quick
  fixes.
- VS Code extension support for OFMarkdown language mode, commands, snippets,
  marketplace assets, status actions, Markdown flavor selection, and the
  packaged JavaScript server module.
- Security hardening around vault confinement, URI classification, parser
  budgets, frontmatter parsing, and workspace trust.

## Repository Map

| Path | Purpose |
|---|---|
| [`src/`](../src/) | LSP server source |
| [`extension/`](../extension/) | VS Code extension client and package |
| [`docs/`](../docs/) | Server requirements, design, ADRs, roadmap, and plans |
| [`extension/docs/`](../extension/docs/) | Extension requirements and design docs |
| [`CHANGELOG.md`](../CHANGELOG.md) | Server release notes |
| [`README.md`](../README.md) | Portable root overview |

## Getting Started

```sh
bun install
bun run build
bun test
```

```sh
cd extension
npm install
npm run compile
npm test
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.
