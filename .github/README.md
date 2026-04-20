<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="../docs/assets/flavor-grenade-lsp-logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="../docs/assets/flavor-grenade-lsp-logo-light.png">
  <img src="../docs/assets/flavor-grenade-lsp-logo-light.png" alt="Flavor Grenade LSP" width="320">
</picture>

[![CI](https://github.com/aaquinas/flavor-grenade-lsp/actions/workflows/ci.yml/badge.svg)](https://github.com/aaquinas/flavor-grenade-lsp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/flavor-grenade-lsp)](https://www.npmjs.com/package/flavor-grenade-lsp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-latest-black?logo=bun)](https://bun.sh/)

</div>

> [!NOTE]
> Flavor Grenade LSP is an **LSP server built exclusively for Obsidian Flavored Markdown (OFM)**. It provides diagnostics, completions, hover, go-to-definition, and rename refactoring for the OFM feature set — things no general-purpose Markdown LSP handles.

---

## What Is It?

Flavor Grenade LSP is a [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) server that understands the full syntax of **Obsidian Flavored Markdown**: wiki-links, transclusion embeds, block references, callouts, tag hierarchies, and alias resolution.

It is built with **NestJS + Bun + TypeScript** and communicates over `stdio` using the LSP 3.17 specification. It integrates with any LSP-capable editor: Neovim, VS Code, Helix, Zed, and others.

---

## Feature Comparison vs marksman

| Feature | Flavor Grenade LSP | marksman |
|---|---|---|
| OFM wiki-links `[[Note]]` | ✅ | Partial |
| Alias resolution `[[Note\|Display]]` | ✅ | ❌ |
| Transclusion embeds `![[Note]]` | ✅ | ❌ |
| Block references `![[Note#^blockid]]` | ✅ | ❌ |
| Block ID completion `^blockid` | ✅ | ❌ |
| Callout syntax `[!TYPE]` | ✅ | ❌ |
| Tag hierarchy `#parent/child` | ✅ | ❌ |
| Diagnostic codes (FG001–FG007) | ✅ | ❌ |
| `.flavor-grenade.toml` configuration | ✅ | ❌ |
| Standard CommonMark links | ✅ | ✅ |
| Heading references `[[Note#Heading]]` | ✅ | ✅ |

> [!TIP]
> If your vault uses plain CommonMark or GitHub Flavored Markdown, marksman is a fine choice. If you use Obsidian's extended syntax — embeds, block refs, callouts — Flavor Grenade LSP is the right tool.

---

## OFM Features Supported

<details>
<summary>Wiki-links and alias resolution</summary>

Flavor Grenade LSP resolves `[[Note Title]]` to the corresponding file in your vault, including aliases defined in YAML frontmatter. It supports:

- `[[Note]]` — bare link
- `[[Note|Display Text]]` — aliased link
- `[[Note#Heading]]` — heading anchor
- `[[Note#^blockid]]` — block reference anchor

Completions trigger on `[[` and list all notes and their aliases. Diagnostics fire when the target does not exist (`FG001`) or when an alias is ambiguous (`FG004`).

</details>

<details>
<summary>Transclusion embeds</summary>

`![[Note]]` and `![[Note#^blockid]]` are resolved through the same index as wiki-links. Broken embed targets produce diagnostic `FG002`. Circular embed chains produce `FG005`.

</details>

<details>
<summary>Block references and IDs</summary>

Block IDs (`^blockid` at the end of a paragraph or list item) are indexed and used to resolve block reference links. Duplicate block IDs within the same file produce `FG006`. Completions for `#^` suggest valid block IDs from the target note.

</details>

<details>
<summary>Callouts</summary>

Callout syntax is `> [!TYPE]` on the first line of a blockquote. Flavor Grenade LSP:

- Completes callout types from the configured set (default: Obsidian built-ins plus any defined in `.flavor-grenade.toml`)
- Diagnoses unknown callout types (`FG007`) when `callouts.strict` is enabled in config

</details>

<details>
<summary>Tag hierarchy</summary>

Tags are indexed with their full path (`#parent/child/grandchild`). Completions list all tags in the vault, ranked by usage frequency. Hover shows the number of occurrences.

</details>

<details>
<summary>Diagnostic codes</summary>

| Code | Name | Description |
|---|---|---|
| `FG001` | `broken-wikilink` | Wiki-link target not found in vault |
| `FG002` | `broken-embed` | Embed target not found in vault |
| `FG003` | `broken-heading-ref` | Heading anchor not found in target note |
| `FG004` | `ambiguous-alias` | Alias resolves to more than one note |
| `FG005` | `circular-embed` | Embed chain contains a cycle |
| `FG006` | `duplicate-block-id` | Block ID appears more than once in file |
| `FG007` | `unknown-callout-type` | Callout type not in configured set |

</details>

---

## Installation

```sh
# npm
npm install -g flavor-grenade-lsp

# Bun
bun add -g flavor-grenade-lsp
```

---

## Quick Start

<details>
<summary>Neovim (lspconfig)</summary>

```lua
-- In your Neovim config (e.g., lua/lsp.lua)
require('lspconfig').flavor_grenade.setup({
  cmd = { 'flavor-grenade-lsp', '--stdio' },
  filetypes = { 'markdown' },
  root_dir = require('lspconfig.util').root_pattern('.flavor-grenade.toml', '.obsidian', '.git'),
  settings = {},
})
```

</details>

<details>
<summary>VS Code (settings.json)</summary>

> [!NOTE]
> VS Code support requires the companion extension (coming soon). In the meantime, use the generic LSP client extension and point it at the binary.

```jsonc
// .vscode/settings.json
{
  "languageServerExample.serverPath": "flavor-grenade-lsp",
  "languageServerExample.serverArgs": ["--stdio"],
  "languageServerExample.filetypes": ["markdown"]
}
```

</details>

---

## Configuration

Create a `.flavor-grenade.toml` in your vault root:

```toml
[vault]
# Root of the vault to index. Defaults to the LSP rootUri.
root = "."

[diagnostics]
# Disable individual diagnostic codes
disable = []
# e.g. disable = ["FG007"]

[callouts]
# When true, unknown callout types produce FG007
strict = true
# Extra callout types beyond the Obsidian defaults
extra = ["CUSTOM", "PROJECT"]

[index]
# Glob patterns to exclude from indexing
exclude = ["templates/**", ".trash/**"]
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Editor (client)                       │
│           Neovim / VS Code / Helix / Zed                 │
└───────────────────────┬──────────────────────────────────┘
                        │ LSP 3.17 (stdio / TCP)
┌───────────────────────▼──────────────────────────────────┐
│               flavor-grenade-lsp process                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  NestJS Application (DI container, lifecycle)       │ │
│  │  ┌──────────────┐  ┌────────────────────────────┐  │ │
│  │  │  LSP Layer   │  │  OFM Feature Modules        │  │ │
│  │  │  (transport, │  │  ┌──────────┐ ┌──────────┐  │  │ │
│  │  │   dispatch,  │  │  │ WikiLink │ │  Embed   │  │  │ │
│  │  │   lifecycle) │  │  └──────────┘ └──────────┘  │  │ │
│  │  └──────┬───────┘  │  ┌──────────┐ ┌──────────┐  │  │ │
│  │         │          │  │ BlockRef │ │ Callout  │  │  │ │
│  │         │          │  └──────────┘ └──────────┘  │  │ │
│  │         │          └────────────────────────────┘  │ │
│  │         │          ┌────────────────────────────┐  │ │
│  │         └─────────►│  Vault Index (in-memory)   │  │ │
│  │                    │  file watcher + parser       │  │ │
│  │                    └────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

The server is a **single long-running process**. It builds an in-memory index of the vault on startup using Bun's native file watcher, then serves LSP requests from that index. No network calls are made; the server is read-only with respect to vault files (except rename refactoring, which writes through the LSP `workspace/applyEdit` mechanism).

---

## Why Not marksman?

[marksman](https://github.com/artempyanykh/marksman) is an excellent LSP for CommonMark and GitHub Flavored Markdown. It does not support Obsidian's extended syntax: block references, transclusion embeds, callout types, or alias-based resolution. Flavor Grenade LSP exists to fill that gap — it is not a replacement for marksman in non-Obsidian contexts.

> [!WARNING]
> Flavor Grenade LSP indexes **Obsidian Flavored Markdown only**. It does not validate CommonMark compliance or GitHub Flavored Markdown extensions. Use it for Obsidian vaults; use marksman for everything else.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. All PRs must target the `develop` branch.

---

## License

[MIT](../LICENSE)
