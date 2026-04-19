# Flavor Grenade LSP

Language Server Protocol server for **Obsidian Flavored Markdown** (OFM).

Built with NestJS and Bun, communicating over stdio JSON-RPC. Provides
definition, references, completion, diagnostics, code actions, rename, hover,
code lens, document symbols, semantic tokens, and document highlight for `.md`
files inside an Obsidian or flavor-grenade vault.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1.30
- Node.js ≥ 20 (for tooling only; the server itself runs under Bun)

## Installation

```bash
bun install
```

## Usage

```bash
bun run build        # compile TypeScript to dist/
node dist/main.js    # start the server (stdio transport)
```

Connect an LSP client (Neovim, VS Code, Helix, etc.) to the server's
stdin/stdout using the standard Language Server Protocol initialization
handshake.

## Development Workflow

```bash
bun run build        # incremental TypeScript build
bun run lint         # ESLint (src/ only)
bun run typecheck    # tsc --noEmit, full type check
bun test             # unit tests via Bun test runner
bun run test:bdd     # BDD integration suite (Cucumber + real server process)
```

## Architecture

The server is composed of NestJS feature modules wired together in
`src/lsp/lsp.module.ts`:

| Module | Responsibility |
| --- | --- |
| `TransportModule` | stdio JSON-RPC framing, reading, writing, and dispatch |
| `ParserModule` | OFM document parsing — wiki-links, tags, callouts, embeds, headings, block anchors, frontmatter |
| `VaultModule` | vault detection, file watching, vault index management |
| `ResolutionModule` | wiki-link resolution (Oracle), diagnostics, link/embed resolution |
| `CompletionModule` | completion providers for wiki-links, tags, callouts, embeds, headings, block refs |
| `NavigationModule` | code lens and document highlight |
| `RenameModule` | prepareRename and textDocument/rename for headings and file stems |
| `CodeActionsModule` | quick-fix code actions (create-missing-file, TOC generator, fix-nbsp, tag-to-YAML) |

See `src/` for the source layout and each subdirectory's `README.md` for
per-module details.

## Vault Detection

The server detects the vault root by walking up the directory tree from the
opened document, looking for `.obsidian/` (Obsidian vault) or
`.flavor-grenade.toml` (flavor-grenade vault). If neither is found the server
runs in `single-file` mode.

## Diagnostic Codes

| Code | Meaning |
| --- | --- |
| FG001 | Broken wiki-link — target file not found |
| FG002 | Ambiguous wiki-link — multiple files match the stem |
| FG003 | Malformed wiki-link — empty or blank target |
| FG006 | Missing block anchor target |
| FG007 | YAML frontmatter parse error |

## License

MIT
