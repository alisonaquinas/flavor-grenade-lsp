# Flavor Grenade LSP

![Flavor Grenade LSP logo](../docs/assets/flavor-grenade-lsp-logo-light-transparent.png)

[![CI](https://github.com/alisonaquinas/flavor-grenade-lsp/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/alisonaquinas/flavor-grenade-lsp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/flavor-grenade-lsp)](https://www.npmjs.com/package/flavor-grenade-lsp)
[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/alisonaquinas.flavor-grenade-lsp)](https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

> [!NOTE]
> Flavor Grenade LSP is a language server and VS Code extension for Obsidian
> Flavored Markdown. It focuses on vault-native features that general Markdown
> language servers do not fully model.

## Current Release Line

| Component | Version | Notes |
|---|---:|---|
| Server | `0.4.2` | LSP package release branch targets `main` |
| VS Code extension | `0.2.2` | Bundled JS server integration, OFMarkdown UX, and Markdown flavor selector |
| CI runtime | Bun `1.3.13` | Matched across typecheck, lint, test, build, and publish jobs |

## What It Understands

| OFM surface | Status |
|---|---|
| Wiki-links, aliases, headings, and block refs | Supported |
| Embeds and local attachments | Supported |
| Tags and frontmatter tags | Supported |
| Obsidian callouts | Supported |
| Markdown inline links, images, reference labels, and same-document anchors | Supported |
| Code, math, comments, and Templater opaque regions | Supported |
| File and heading rename edits | Supported |
| VS Code OFMarkdown language mode, snippets, commands, and status actions | Supported |

## Quick Start

```sh
bun install
bun run build
bun test
```

For extension work:

```sh
cd extension
npm install
npm run compile
npm test
```

## Useful Links

| Resource | Link |
|---|---|
| Project README | [README.md](../README.md) |
| Concepts glossary | [CONCEPTS.md](../CONCEPTS.md) |
| Changelog | [CHANGELOG.md](../CHANGELOG.md) |
| Contributing guide | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Security policy | [SECURITY.md](./SECURITY.md) |
| Server design docs | [docs/](../docs/) |
| Extension design docs | [extension/docs/](../extension/docs/) |

## Diagnostic Codes

| Code | Meaning |
|---|---|
| `FG001` | Broken wiki-link, Markdown note link, or heading target |
| `FG002` | Ambiguous wiki-link, Markdown note link, attachment, or heading target |
| `FG003` | Malformed wiki-link |
| `FG004` | Broken embed, Markdown image, or attachment target |
| `FG005` | Missing block anchor target |
| `FG006` | Non-breaking space in document body text |
| `FG007` | YAML frontmatter parse error |

## Maintainer Notes

- PRs to `develop` cover feature and fix work.
- Release PRs target `main`.
- Pull requests are merged with merge commits.
- npm publish runs only for pushed `v*.*.*` tags.
