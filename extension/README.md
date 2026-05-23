# Flavor Grenade LSP — Obsidian Markdown Support

Language intelligence for [Obsidian Flavored Markdown](https://help.obsidian.md/Editing+and+formatting/Obsidian+Flavored+Markdown) in Visual Studio Code. Powered by the [flavor-grenade-lsp](https://github.com/alisonaquinas/flavor-grenade-lsp) language server.

## OFMarkdown In VS Code

![OFMarkdown language mode promotion](images/marketplace/ofmarkdown-mode.png)

Vault notes stay in VS Code's built-in **Markdown** mode while Flavor Grenade
applies the active Markdown flavor behind the language-server features.

![Flavor Grenade status bar indexing](images/marketplace/status-indexing.png)

The status bar shows whether Flavor Grenade is starting, indexing, ready,
disabled, crashed, or misconfigured without embedding the document count in the
status text. A separate Markdown flavor status item shows the current effective
flavor, such as **Markdown: Obsidian**, and opens the Flavor Grenade selector.

![Flavor Grenade wiki-link completion](images/marketplace/wiki-link-completion.png)

Wiki-link completion offers vault notes as soon as you type `[[`, using the
same indexed document graph that powers definitions, references, and rename.
Following links is server-resolved, so Obsidian-style folder-implicit targets
such as `[[sources/foo]]` can open `wiki/sources/foo.md` when that is the
unique vault path suffix.

![Flavor Grenade heading and block-anchor completion](images/marketplace/heading-block-completion.png)

Heading and block-anchor completions make `[[note#heading]]` and
`[[note#^block]]` links discoverable without memorizing target structure.

![Flavor Grenade reference code lens](images/marketplace/reference-code-lens.png)

Reference code lens puts incoming-link counts above headings and block anchors
so frequently referenced knowledge surfaces are easy to spot.

![Flavor Grenade embed diagnostics and hover](images/marketplace/embed-diagnostics-hover.png)

Embed diagnostics identify missing targets, while hover previews give quick
context for resolved note and attachment embeds.

![Flavor Grenade tag completion and references](images/marketplace/tag-completion-references.png)

Tag completion and references use the vault-wide tag index, including nested
Obsidian tag paths.

![Flavor Grenade callout completion](images/marketplace/callout-completion.png)

Callout completion offers common Obsidian callout types inside quote blocks.

## Features

- **Completions** — `[[` triggers wiki-link completions across the vault; `#` triggers tag completions; heading and block-anchor completions inside links
- **Diagnostics** — Broken wiki-links (`BrokenLink`), ambiguous links (`AmbiguousLink`), broken embeds (`BrokenEmbed`), malformed frontmatter (`MalformedFrontmatter`)
- **Go to Definition** — Navigate from `[[wiki-link]]` to the target document, heading, or block anchor, including Obsidian-style path-suffix targets
- **Rename** — Rename a document or heading and update all incoming references across the vault
- **Code Actions** — Quick-fix to create a missing linked document; extract selection to new note
- **Code Lens** — Inline reference counts on headings and documents
- **Semantic Tokens** — Syntax highlighting for wiki-links, tags, embeds, and block references
- **Markdown flavor selector** — The status bar shows the effective flavor and opens a selector for Auto Detect or an explicit flavor without using VS Code's language picker

## OFMarkdown Editor Affordances

The extension contributes snippets only for the **OFMarkdown** language mode:

| Prefix | Inserts |
|--------|---------|
| `ofm-callout` | Obsidian callout block |
| `ofm-embed` | `![[embed]]` link |
| `ofm-wikilink` | `[[wiki-link]]` |
| `ofm-aliases` | YAML `aliases` frontmatter |
| `ofm-tags` | YAML `tags` frontmatter |
| `ofm-block-anchor` | `^block-id` anchor |

The Markdown flavor selector keeps `.md` files in VS Code's built-in Markdown
mode. Generic Markdown keeps VS Code's normal Markdown behavior unless a
workspace, project, or user flavor selection applies.

Payload-free Flavor Grenade commands have OFMarkdown-scoped keybindings:

| Command | Windows/Linux | macOS |
|---------|---------------|-------|
| Rebuild Index | `Ctrl+Alt+G Ctrl+Alt+R` | `Cmd+Alt+G Cmd+Alt+R` |
| Show Status Actions | `Ctrl+Alt+G Ctrl+Alt+S` | `Cmd+Alt+G Cmd+Alt+S` |
| Show Output | `Ctrl+Alt+G Ctrl+Alt+O` | `Cmd+Alt+G Cmd+Alt+O` |

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `flavorGrenade.server.path` | `string` | `""` | Custom user-level path to a language server command. Workspace values are ignored for safety. Leave empty to use the bundled server module. |
| `flavorGrenade.linkStyle` | `string` | `"file-stem"` | Wiki-link completion style. Options: `file-stem`, `title-slug`, `file-path-stem`. |
| `flavorGrenade.markdownFlavor` | `string` | `"auto"` | Markdown flavor selector. Options: `auto`, `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, `stack-overflow`. |
| `flavorGrenade.completion.candidates` | `number` | `50` | Maximum number of completion items returned. |
| `flavorGrenade.diagnostics.suppress` | `string[]` | `[]` | Diagnostic codes to suppress (e.g. `["AmbiguousLink", "BrokenEmbed"]`). |
| `flavorGrenade.trace.server` | `string` | `"off"` | Trace communication between VS Code and the language server. Options: `off`, `messages`, `verbose`. |

## Getting Started

1. Install **Flavor Grenade** from the [VS Code Marketplace](https://marketplace.visualstudio.com/).
2. Open an Obsidian vault folder in VS Code.
3. Open any vault `.md` file — the language server starts automatically and the Markdown flavor status item reports the effective flavor.

That's it. Wiki-link completions, diagnostics, go-to-definition, and all other features activate as soon as the server finishes indexing your vault. The status bar shows indexing progress.

Generic Markdown files outside detected vaults stay in VS Code's normal
**Markdown** mode. If you manually choose another language mode for a document,
Flavor Grenade leaves that choice alone.

Language-specific VS Code settings can target OFMarkdown:

```json
{
  "[ofmarkdown]": {
    "editor.wordWrap": "on"
  }
}
```

## Activation Behavior

Flavor Grenade starts automatically when VS Code opens a workspace that looks
like an Obsidian or Flavor Grenade vault:

- A workspace containing `.obsidian/` activates the extension and starts vault
  membership detection.
- A workspace containing `.flavor-grenade.toml` also activates the extension and
  starts vault membership detection.
- Opening Markdown in a generic workspace with neither marker keeps Flavor
  Grenade idle. VS Code continues to treat those files as normal **Markdown**,
  and the extension does not start vault indexing just because a README or other
  ordinary `.md` file is open.
- Opening a supported `markdown` or `ofmarkdown` file can wake the extension,
  but startup still checks for a positive vault signal before doing vault work.
- Running an explicit command, such as **Flavor Grenade: Restart Server**,
  **Flavor Grenade: Rebuild Index**, or **Flavor Grenade: Show Output**, can
  wake the extension. Command wake does not promise that a vault exists or that
  indexing will find content; the same startup checks still run before the
  command path starts server work.

This behavior comes from Phase E7 activation precision and the extension parity
requirements for `Extension.Activation.VaultPrecision` and
`Extension.Activation.MarkerEvents`.

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type "Flavor Grenade":

- **Flavor Grenade: Restart Server** — Stop and restart the language server
- **Flavor Grenade: Rebuild Index** — Re-scan the vault and rebuild the document index
- **Flavor Grenade: Show Output** — Open the language server output channel for troubleshooting

Flavor Grenade also registers bridge commands used by the language server and
extension UI:

- `flavorGrenade.showReferences`
- `flavorGrenade.followLink`
- `flavorGrenade.openEmbedTarget`
- `flavorGrenade.showBacklinks`
- `flavorGrenade.showOutlinks`
- `flavorGrenade.revealVaultRoot`
- `flavorGrenade.copyDiagnosticInfo`

Bridge payloads are plain JSON: file URI strings, zero-based positions, ranges,
locations, and diagnostic text. Invalid payloads fail safely before VS Code APIs
are called, with no uncaught extension-host exception. Maintainer details live
in [extension/docs/features/command-bridge-contracts.md](docs/features/command-bridge-contracts.md).

## Development Smoke Test

1. From the repository root, run `bun install`.
2. From `extension/`, run `npm ci`.
3. Open `extension/` in VS Code.
4. Start the **Run Extension** launch configuration.
5. Edit code under the repository root `src/`; the server TypeScript watch task rebuilds `../dist/main.js`.
6. Run **Flavor Grenade: Restart Server** in the Extension Host window.
7. Open a note inside a folder containing `.obsidian/`; confirm the Markdown flavor status item shows **Markdown: Obsidian**.
8. Open a non-vault Markdown file; confirm the language picker remains **Markdown**.
9. Confirm changed LSP behavior is visible after the TypeScript watch task rebuilds `../dist/main.js`.

## Requirements

- VS Code 1.82.0 or later
- An Obsidian vault or a folder configured with `.flavor-grenade.toml`

## Links

- [Source code](https://github.com/alisonaquinas/flavor-grenade-lsp)
- [Issue tracker](https://github.com/alisonaquinas/flavor-grenade-lsp/issues)
- [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
