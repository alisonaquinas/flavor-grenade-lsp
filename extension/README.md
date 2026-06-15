# Flavor Grenade LSP — Multi-flavor Markdown Support

Multi-flavor Markdown support for Obsidian vaults and flavor-aware Markdown
projects in Visual Studio Code.

Flavor Grenade keeps ordinary `.md` files in VS Code's built-in Markdown mode
while the extension and bundled language server add vault indexing,
Obsidian-style navigation, Markdown flavor detection, structured-document
diagnostics, and project-aware completions. See the current docs at
[flavor-grenade.dev](https://flavor-grenade.dev/).

![Flavor Grenade wiki-link completion](https://flavor-grenade.dev/assets/marketplace/wiki-link-completion.png)

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

![Markdown flavor selector with CommonMark fallback](https://flavor-grenade.dev/assets/marketplace/markdown-flavor-selector.png)

Markdown files stay in VS Code's Markdown mode. The Flavor Grenade selector
shows the active base flavor and whether it came from `.mdfattributes`, Auto
Detect, an Obsidian vault marker, syntax inference, or CommonMark fallback.

![Flavor Grenade status bar indexing](https://flavor-grenade.dev/assets/marketplace/status-indexing.png)

The status bar reports server state and active Markdown flavor. Auto Detect uses
Obsidian vault evidence and syntax signals, then CommonMark fallback. It runs
when no concrete `.mdfattributes` flavor applies, when `flavor=auto` matches, or
when `!flavor` clears the effective flavor selected so far.

![Flavor Grenade heading and block-anchor completion](https://flavor-grenade.dev/assets/marketplace/heading-block-completion.png)

Heading and block-anchor completions make `[[note#heading]]` and
`[[note#^block]]` links discoverable.

![Flavor Grenade reference code lens](https://flavor-grenade.dev/assets/marketplace/reference-code-lens.png)

Reference code lens surfaces incoming-link counts above headings and block
anchors.

![Flavor Grenade embed diagnostics and hover](https://flavor-grenade.dev/assets/marketplace/embed-diagnostics-hover.png)

Embed diagnostics flag missing targets. Hovers show context for resolved notes
and local attachments.

![Flavor Grenade tag completion and references](https://flavor-grenade.dev/assets/marketplace/tag-completion-references.png)

Tag completion and references use the vault-wide tag index, including nested
Obsidian tag paths.

![Flavor Grenade callout completion](https://flavor-grenade.dev/assets/marketplace/callout-completion.png)

Callout completion offers common Obsidian callout types inside quote blocks.

## Getting Started

1. Install Flavor Grenade LSP from the Visual Studio Marketplace.
2. Open an Obsidian vault or a configured Markdown project.
3. Open a Markdown file.
4. Wait for the status bar to report that Flavor Grenade is ready.
5. Type `[[`, `#`, `> [!`, or a Markdown link target to use completions.

Generic Markdown workspaces stay idle until there is positive project evidence
or you run an explicit Flavor Grenade command.

## Project Configuration

Flavor configuration lives in Git-style files that can appear at the workspace
root or in subdirectories:

- `.mdfignore` controls Flavor Grenade visibility. Matching files are inactive
  and are not processed, indexed, completed, diagnosed, navigated, renamed, or
  used as references unless a later negated rule re-includes them.
- `.mdfattributes` controls explicit base flavor and structured-profile
  attributes. Rules cascade from the root toward the active file's directory.
  Later matching rules win. Negated selectors cancel matching rules from the
  same `.mdfattributes` file, `!flavor` clears the effective flavor selected so
  far, and `flavor=auto` asks Auto Detect to run.

Example `.mdfattributes`:

```gitattributes
*.md flavor=auto
docs/github/*.md flavor=gfm
docs/decisions/*.md flavor=commonmark structured_profiles=madr
CHANGELOG.md flavor=auto structured_profiles=keep-a-changelog
```

Example `.mdfignore`:

```gitignore
generated/
private/
!private/README.md
```

When these files are absent, Auto Detect applies to the opened directory and
all subdirectories by default.

Supported `flavor` values:

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

The Markdown flavor selector writes `.mdfattributes`. After you select a flavor,
the extension asks whether the rule applies to the selected file or all
Markdown files in that directory. Choosing Auto Detect removes or resets the
matching scoped `flavor` assignment instead of writing a legacy workspace
setting.

## VS Code Settings

- `flavorGrenade.linkStyle`: wiki-link completion style, one of `file-stem`,
  `title-slug`, or `file-path-stem`
- `flavorGrenade.completion.candidates`: maximum completion items returned
- `flavorGrenade.diagnostics.suppress`: diagnostic codes to suppress
- `flavorGrenade.mdfConfig.maxBytes`: maximum `.mdfignore` or `.mdfattributes`
  file size read for flavor configuration; changes are sent to the running
  server without a restart
- `flavorGrenade.trace.server`: LSP trace level
- `flavorGrenade.server.path`: user-level custom language-server command path

Flavor and structured-profile persistence belongs in `.mdfattributes`, not VS
Code workspace settings.

## Commands

Open the Command Palette and search for "Flavor Grenade":

- Restart Server
- Rebuild Index
- Show Output
- Show Status Actions
- Select Markdown Flavor
- Open Troubleshooting

Default command keybindings are active in file-backed Markdown documents only
when Flavor Grenade has non-fallback flavor evidence, such as `.obsidian/`,
`.mdfattributes`, or strong syntax inference.

## Requirements

- VS Code 1.120.0 or later
- A local file-system workspace. Restricted Mode and virtual workspaces are not
  supported because the extension starts a bundled language server and indexes
  local files.

## Links

- [Source code](https://github.com/alisonaquinas/flavor-grenade-lsp)
- [Documentation website](https://flavor-grenade.dev/)
- [Issue tracker](https://github.com/alisonaquinas/flavor-grenade-lsp/issues)
- [Changelog](https://github.com/alisonaquinas/flavor-grenade-lsp/blob/main/extension/CHANGELOG.md)

## License

MIT
