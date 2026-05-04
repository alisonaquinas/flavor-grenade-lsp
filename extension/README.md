# Flavor Grenade LSP — Obsidian Markdown Support

Language intelligence for [Obsidian Flavored Markdown](https://help.obsidian.md/Editing+and+formatting/Obsidian+Flavored+Markdown) in Visual Studio Code. Powered by the [flavor-grenade-lsp](https://github.com/alisonaquinas/flavor-grenade-lsp) language server.

## Features

- **Completions** — `[[` triggers wiki-link completions across the vault; `#` triggers tag completions; heading and block-anchor completions inside links
- **Diagnostics** — Broken wiki-links (`BrokenLink`), ambiguous links (`AmbiguousLink`), broken embeds (`BrokenEmbed`), malformed frontmatter (`MalformedFrontmatter`)
- **Go to Definition** — Navigate from `[[wiki-link]]` to the target document, heading, or block anchor
- **Rename** — Rename a document or heading and update all incoming references across the vault
- **Code Actions** — Quick-fix to create a missing linked document; extract selection to new note
- **Code Lens** — Inline reference counts on headings and documents
- **Semantic Tokens** — Syntax highlighting for wiki-links, tags, embeds, and block references
- **OFMarkdown language mode** — Obsidian vault notes are recognized as `OFMarkdown` without taking over generic Markdown files

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `flavorGrenade.server.path` | `string` | `""` | Custom path to the language server binary. Leave empty to use the bundled binary. |
| `flavorGrenade.linkStyle` | `string` | `"file-stem"` | Wiki-link completion style. Options: `file-stem`, `title-slug`, `file-path-stem`. |
| `flavorGrenade.completion.candidates` | `number` | `50` | Maximum number of completion items returned. |
| `flavorGrenade.diagnostics.suppress` | `string[]` | `[]` | Diagnostic codes to suppress (e.g. `["AmbiguousLink", "BrokenEmbed"]`). |
| `flavorGrenade.trace.server` | `string` | `"off"` | Trace communication between VS Code and the language server. Options: `off`, `messages`, `verbose`. |

## Getting Started

1. Install **Flavor Grenade** from the [VS Code Marketplace](https://marketplace.visualstudio.com/).
2. Open an Obsidian vault folder in VS Code.
3. Open any vault `.md` file — the language server starts automatically and VS Code switches the language picker to **OFMarkdown**.

That's it. Wiki-link completions, diagnostics, go-to-definition, and all other features activate as soon as the server finishes indexing your vault. The status bar shows indexing progress.

Generic Markdown files outside detected vaults stay in VS Code's normal **Markdown** mode. If you manually choose another language mode for a document, Flavor Grenade leaves that choice alone.

Language-specific VS Code settings can target OFMarkdown:

```json
{
  "[ofmarkdown]": {
    "editor.wordWrap": "on"
  }
}
```

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type "Flavor Grenade":

- **Flavor Grenade: Restart Server** — Stop and restart the language server
- **Flavor Grenade: Rebuild Index** — Re-scan the vault and rebuild the document index
- **Flavor Grenade: Show Output** — Open the language server output channel for troubleshooting

## Development Smoke Test

1. From the repository root, run `bun install`.
2. From `extension/`, run `npm ci`.
3. Open `extension/` in VS Code.
4. Start the **Run Extension** launch configuration.
5. Edit code under the repository root `src/`; the server TypeScript watch task rebuilds `../dist/main.js`.
6. Run **Flavor Grenade: Restart Server** in the Extension Host window.
7. Open a note inside a folder containing `.obsidian/`; confirm the language picker becomes **OFMarkdown**.
8. Open a non-vault Markdown file; confirm the language picker remains **Markdown**.
9. Confirm changed LSP behavior is visible without rebuilding the bundled server binary.

## Requirements

- VS Code 1.81.0 or later
- An Obsidian vault or a folder configured with `.flavor-grenade.toml`

## Links

- [Source code](https://github.com/alisonaquinas/flavor-grenade-lsp)
- [Issue tracker](https://github.com/alisonaquinas/flavor-grenade-lsp/issues)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
