# Changelog

## [0.1.0] — 2026-05-04

### Added

- Initial Marketplace release of the Flavor Grenade VS Code extension.
- Bundled `flavor-grenade-lsp` server binaries for Linux, macOS, Windows, and Alpine targets.
- LanguageClient integration for wiki-link, embed, tag, heading, block-reference, diagnostic, navigation, rename, code-action, CodeLens, and semantic-token support.
- Status bar showing vault indexing state and document count.
- Commands: Restart Server, Rebuild Index, Show Output.
- Configuration: server path override, link style, completion candidate cap, diagnostic suppression, and server trace level.
- OFMarkdown language mode for detected Obsidian or Flavor Grenade vault notes, while generic Markdown remains Markdown.
- Extension development workflow with VS Code F5 launch, client/server watch tasks, and source-based LSP restart loop.
