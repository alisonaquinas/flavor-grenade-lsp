# Flavor Grenade — Obsidian Markdown Support

Language intelligence for [Obsidian Flavored Markdown](https://help.obsidian.md/Editing+and+formatting/Obsidian+Flavored+Markdown) in Visual Studio Code. Powered by the [flavor-grenade-lsp](https://github.com/alisonaquinas/flavor-grenade-lsp) language server.

## Features

- **Completions** — `[[` triggers wiki-link completions across the vault; `#` triggers tag completions; heading and block-anchor completions inside links
- **Diagnostics** — Broken wiki-links (`BrokenLink`), ambiguous links (`AmbiguousLink`), broken embeds (`BrokenEmbed`), malformed frontmatter (`MalformedFrontmatter`)
- **Go to Definition** — Navigate from `[[wiki-link]]` to the target document, heading, or block anchor
- **Rename** — Rename a document or heading and update all incoming references across the vault
- **Code Actions** — Quick-fix to create a missing linked document; extract selection to new note
- **Code Lens** — Inline reference counts on headings and documents
- **Semantic Tokens** — Syntax highlighting for wiki-links, tags, embeds, and block references

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `flavorGrenade.server.path` | `string` | `""` | Custom path to the language server binary. Leave empty to use the bundled binary. |
| `flavorGrenade.linkStyle` | `string` | `"file-stem"` | Wiki-link completion style. Options: `file-stem`, `relative-path`. |
| `flavorGrenade.completion.candidates` | `number` | `50` | Maximum number of completion items returned. |
| `flavorGrenade.diagnostics.suppress` | `string[]` | `[]` | Diagnostic codes to suppress (e.g. `["AmbiguousLink", "BrokenEmbed"]`). |
| `flavorGrenade.trace.server` | `string` | `"off"` | Trace communication between VS Code and the language server. Options: `off`, `messages`, `verbose`. |

## Getting Started

1. Install **Flavor Grenade** from the [VS Code Marketplace](https://marketplace.visualstudio.com/).
2. Open an Obsidian vault folder in VS Code.
3. Open any `.md` file — the language server starts automatically.

That's it. Wiki-link completions, diagnostics, go-to-definition, and all other features activate as soon as the server finishes indexing your vault. The status bar shows indexing progress.

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type "Flavor Grenade":

- **Flavor Grenade: Restart Server** — Stop and restart the language server
- **Flavor Grenade: Rebuild Index** — Re-scan the vault and rebuild the document index
- **Flavor Grenade: Show Output** — Open the language server output channel for troubleshooting

## Requirements

- VS Code 1.93.0 or later
- An Obsidian vault (any folder containing `.md` files works)

## Links

- [Source code](https://github.com/alisonaquinas/flavor-grenade-lsp)
- [Issue tracker](https://github.com/alisonaquinas/flavor-grenade-lsp/issues)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
