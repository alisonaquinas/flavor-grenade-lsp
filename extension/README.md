# Flavor Grenade LSP

Markdown language intelligence for Obsidian vaults and flavor-aware Markdown
workspaces in Visual Studio Code.

Flavor Grenade keeps ordinary `.md` files in VS Code's built-in Markdown mode
while the extension and bundled language server add vault indexing,
Obsidian-style navigation, Markdown flavor detection, structured-document
diagnostics, and project-aware completions.

![Flavor Grenade wiki-link completion](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/wiki-link-completion.png)

## What You Get

- Wiki-link, heading, block-anchor, tag, callout, embed, attachment, and
  Markdown-link completions
- Go to definition, find references, hovers, document links, symbols, folding,
  semantic tokens, code lens, rename, and code actions
- Diagnostics for broken wiki-links, ambiguous links, malformed wiki-links,
  broken embeds or attachments, missing block anchors, non-breaking spaces,
  malformed frontmatter, and structured-document issues
- Markdown flavor auto-detection for Obsidian, CommonMark, GFM, GLFM, Pandoc,
  MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, Stack
  Overflow, and Original Markdown
- Structured profile flags for Keep a Changelog, Common Changelog, and MADR
  layered over any base Markdown flavor

## Screenshots

![OFMarkdown language mode promotion](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/ofmarkdown-mode.png)

Detected vault files can use the OFMarkdown language contribution when that is
useful, but normal Markdown files stay in VS Code's Markdown mode unless Flavor
Grenade has project evidence.

![Flavor Grenade status bar indexing](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/status-indexing.png)

The status bar reports server state and active Markdown flavor. Auto Detect uses
project config first, then vault markers, then syntax and context inference,
then CommonMark fallback.

![Flavor Grenade heading and block-anchor completion](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/heading-block-completion.png)

Heading and block-anchor completions make `[[note#heading]]` and
`[[note#^block]]` links discoverable.

![Flavor Grenade reference code lens](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/reference-code-lens.png)

Reference code lens surfaces incoming-link counts above headings and block
anchors.

![Flavor Grenade embed diagnostics and hover](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/embed-diagnostics-hover.png)

Embed diagnostics flag missing targets. Hovers show context for resolved notes
and local attachments.

![Flavor Grenade tag completion and references](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/tag-completion-references.png)

Tag completion and references use the vault-wide tag index, including nested
Obsidian tag paths.

![Flavor Grenade callout completion](https://media.githubusercontent.com/media/alisonaquinas/flavor-grenade-lsp/main/extension/images/marketplace/callout-completion.png)

Callout completion offers common Obsidian callout types inside quote blocks.

## Getting Started

1. Install Flavor Grenade LSP from the Visual Studio Marketplace.
2. Open an Obsidian vault or a folder containing `.flavor-grenade.toml`.
3. Open a Markdown file.
4. Wait for the status bar to report that Flavor Grenade is ready.
5. Type `[[`, `#`, `> [!`, or a Markdown link target to use completions.

Generic Markdown workspaces stay idle until there is positive project evidence
or you run an explicit Flavor Grenade command.

## Project Configuration

Use `.flavor-grenade.toml` to pin a project when Auto Detect is not enough:

```toml
markdown_flavor = "gfm"
structured_profiles = ["keep-a-changelog"]
```

Supported `markdown_flavor` values:

- `original`
- `commonmark`
- `obsidian`
- `gfm`
- `glfm`
- `pandoc`
- `multimarkdown`
- `mdx`
- `kramdown`
- `markdown-extra`
- `r-markdown`
- `reddit`
- `stack-overflow`

Supported `structured_profiles` values:

- `keep-a-changelog`
- `common-changelog`
- `madr`
- `none`

Keep a Changelog and Common Changelog are mutually exclusive. MADR can combine
with either changelog profile when the document context supports it.

## VS Code Settings

- `flavorGrenade.markdownFlavor`: `auto` or an explicit base Markdown flavor
- `flavorGrenade.markdownStructuredProfiles`: `auto`, `none`, or an array of
  structured profile ids
- `flavorGrenade.linkStyle`: wiki-link completion style, one of `file-stem`,
  `title-slug`, or `file-path-stem`
- `flavorGrenade.completion.candidates`: maximum completion items returned
- `flavorGrenade.diagnostics.suppress`: diagnostic codes to suppress
- `flavorGrenade.trace.server`: LSP trace level
- `flavorGrenade.server.path`: user-level custom language-server command path

## Commands

Open the Command Palette and search for "Flavor Grenade":

- Restart Server
- Rebuild Index
- Show Output
- Show Status Actions
- Select Markdown Flavor
- Open Troubleshooting

## Requirements

- VS Code 1.120.0 or later
- A local file-system workspace. Restricted Mode and virtual workspaces are not
  supported because the extension starts a bundled language server and indexes
  local files.

## Links

- [Source code](https://github.com/alisonaquinas/flavor-grenade-lsp)
- [Issue tracker](https://github.com/alisonaquinas/flavor-grenade-lsp/issues)
- [Changelog](https://github.com/alisonaquinas/flavor-grenade-lsp/blob/main/extension/CHANGELOG.md)
- [Documentation website](https://www.alisonaquinas.com/flavor-grenade-lsp/)

## License

MIT
