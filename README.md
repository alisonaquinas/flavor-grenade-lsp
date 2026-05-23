# Flavor Grenade LSP

Flavor Grenade LSP is a Language Server Protocol server for Obsidian Flavored
Markdown, often shortened to OFM. It provides editor intelligence for vaults
that use wiki-links, embeds, block references, tags, callouts, frontmatter,
Markdown links, attachments, and heading anchors.

The server is written in TypeScript, wired with NestJS dependency injection,
and built with Bun. It communicates over stdio JSON-RPC and is intended to be
used by LSP-capable editors and by the companion VS Code extension in
`extension/`.

## Current Status

- Server package version: `0.4.2`
- VS Code extension package version: `0.2.2`
- Release branch target: `main`
- Integration branch: `develop`
- Runtime used by CI: Bun `1.3.13`
- Publish workflow: npm trusted publishing from `v*.*.*` tags

## Supported Language Features

- Wiki-links: `[[Note]]`, `[[Note|Alias]]`, `[[Note#Heading]]`, and
  `[[Note#^block-id]]`
- Embeds: `![[Note]]`, `![[Note#Heading]]`, `![[Note#^block-id]]`, and local
  attachment embeds
- Standard Markdown inline links, image links, reference labels, and reference
  definitions
- Same-document Markdown anchors such as `[text](#heading)`
- Block anchors of the form `^block-id`
- Tags, including slash-delimited tag hierarchies
- Obsidian callouts such as `> [!NOTE]`
- YAML frontmatter, including aliases and tags
- Opaque regions for code, math, comments, and Templater blocks

## Editor Features

- Completion for notes, headings, block anchors, tags, callouts, embeds, and
  attachments
- Go to definition for wiki-links, Markdown links, headings, block anchors,
  embeds, and reference labels
- Find references and backlinks for indexed OFM symbols
- Hover for resolved links, attachments, tags, callouts, and diagnostics
- Document symbols, workspace symbols, semantic tokens, document highlights,
  folding ranges, selection ranges, and document links
- Rename support for headings and file stems, including updates to inbound
  references
- Code actions for common fixes such as creating missing notes, fixing
  non-breaking spaces, generating tables of contents, and converting tags to
  frontmatter
- File-operation planning for editor rename workflows

## Security Posture

The server treats vault content as local user data. It does not make network
calls and it does not write directly to the vault during normal diagnostics,
completion, or navigation. Rename and create-file workflows are returned as LSP
workspace edits for the client to apply.

The current implementation includes:

- Vault-relative document identifiers with no file extension
- URI scheme checks for local file targets
- Realpath confinement for vault scans and symlink handling
- Root-level `.obsidian/` ignored by Git
- Parser limits for large files, YAML frontmatter size, YAML aliases, and
  recursive embed resolution
- Prototype-pollution rejection during frontmatter parsing
- VS Code extension safeguards for untrusted and virtual workspaces
- User-level override only for custom server command paths

## Prerequisites

- Bun `1.3.13` or newer for server development
- Node.js `20` or newer for VS Code extension tooling
- GitHub CLI for maintainers who open and merge release pull requests

## Install Dependencies

```bash
bun install
```

The extension has its own Node-based toolchain:

```bash
cd extension
npm install
```

## Build And Test

Run the server checks from the repository root:

```bash
bun run build
bun run typecheck
bun run lint
bun test
bun run bdd
```

Run the extension checks from `extension/`:

```bash
npm run compile
npm test
npm run test:host
npm run verify:marketplace-assets
npm run verify:package-targets
```

## Run The Server

Build the TypeScript output and start the stdio server:

```bash
bun run build
node dist/main.js
```

LSP clients should connect to the process over stdin and stdout using the
standard Language Server Protocol initialization handshake.

## Vault Detection

The server detects a vault by walking upward from the opened document and
looking for one of these markers:

- `.obsidian/`
- `.flavor-grenade.toml`

If no marker is found, the server runs in single-file mode. Single-file mode
keeps syntax-aware local features available, but suppresses diagnostics that
would require a vault-wide index.

## Architecture

The main modules are:

- `TransportModule`: stdio JSON-RPC framing, reading, writing, and dispatch
- `ParserModule`: OFM parsing and opaque-region detection
- `VaultModule`: vault detection, scanning, file watching, attachment indexing,
  and file-operation refresh
- `ResolutionModule`: Oracle resolution, diagnostics, reference graph, and
  Markdown target classification
- `CompletionModule`: completion routing and trigger-specific providers
- `NavigationModule`: code lens and document highlight support
- `RenameModule`: prepare-rename and rename support
- `CodeActionsModule`: quick fixes and generated workspace edits
- `TagsModule`: vault-wide tag indexing
- `extension/`: VS Code client, OFMarkdown language contribution, commands,
  snippets, marketplace assets, and packaged server integration

`VaultIndex` is the single source of truth for parsed documents. Handlers read
from it instead of maintaining parallel document caches.

## Diagnostic Codes

- `FG001`: Broken wiki-link, Markdown note link, or heading target
- `FG002`: Ambiguous wiki-link, Markdown note link, attachment, or heading
  target
- `FG003`: Malformed wiki-link
- `FG004`: Broken embed, Markdown image, or attachment target
- `FG005`: Missing block anchor target
- `FG006`: Non-breaking space in document body text
- `FG007`: YAML frontmatter parse error

## Documentation

Long-form product, architecture, BDD, DDD, ADR, roadmap, and Planguage
requirements live in `docs/`. Extension-specific product and design documents
live in `extension/docs/`.

Root-level Markdown is kept portable and uses standard Markdown syntax.
GitHub-facing files in `.github/` may use GitHub Flavored Markdown features.

## Branches

- `main`: released versions
- `develop`: integration branch
- `feature/*`: feature work targeting `develop`
- `release/*`: release work targeting `main`

Repository pull requests are merged with merge commits.

## License

MIT
