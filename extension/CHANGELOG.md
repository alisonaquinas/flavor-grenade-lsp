# Changelog

## [0.1.4] — 2026-05-09

### Fixed

- Block command-triggered server startup in Restricted Mode and virtual workspaces.
- Keep restart, rebuild index, and show output commands from spawning the language server when the workspace environment is unsupported.

### Changed

- Ignore only the repository-root `.obsidian/` folder so nested fixture vault markers remain trackable.

## [0.1.3] — 2026-05-06

### Fixed

- Rebuilt Windows extension packages without Bun bytecode to avoid a startup crash in the bundled server executable.
- Added a Windows smoke test for the bundled `win32-x64` server binary before Marketplace publish.

## [0.1.2] — 2026-05-05

### Fixed

- Ensure Marketplace extension packages include the real PNG icon when built from Git LFS checkouts.

## [0.1.1] — 2026-05-04

### Fixed

- Replaced the placeholder Marketplace package icon with the no-text Flavor Grenade logo mark.

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
