# Flavor Grenade LSP

Language Server Protocol support for Obsidian-style Markdown vaults and
flavor-aware Markdown projects.

Flavor Grenade indexes local Markdown workspaces and provides editor features
for wiki-links, embeds, headings, block references, tags, frontmatter,
attachments, Markdown links, and structured documents such as changelogs and
MADR decision records.

## Install

Most users should install the VS Code extension:

- [Flavor Grenade LSP on the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp)
- [Source repository](https://github.com/alisonaquinas/flavor-grenade-lsp)

The npm package is the language server for LSP-capable editors and extension
integrations:

```bash
npm install -g flavor-grenade-lsp
flavor-grenade-lsp
```

The server speaks LSP over stdio. Editors should launch the command and perform
the standard `initialize` handshake over stdin/stdout.

## What It Supports

Core Obsidian-style Markdown support:

- Wiki-links: `[[Note]]`, `[[Note|Alias]]`, `[[Note#Heading]]`, and
  `[[Note#^block-id]]`
- Embeds for notes, headings, blocks, and local attachments
- Tags, nested tag paths, callouts, YAML frontmatter, aliases, and block anchors
- Markdown inline links, image links, reference labels, and heading anchors
- Opaque-region handling for code, math, comments, and Templater blocks

Flavor-aware Markdown support:

- Auto-detection from project config, vault markers, file syntax, and document
  context
- Explicit base flavors for Original Markdown, CommonMark, Obsidian, GFM, GLFM,
  Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, and
  Stack Overflow Markdown
- Structured profile flags for Keep a Changelog, Common Changelog, and MADR
  layered over any base flavor

## Editor Features

- Completions for notes, headings, block anchors, tags, callouts, embeds,
  attachments, Markdown flavor snippets, and structured-profile headings
- Diagnostics for broken links, ambiguous targets, malformed wiki-links, broken
  embeds or attachments, missing block anchors, non-breaking spaces, malformed
  frontmatter, and structured-profile issues
- Go to definition, find references, document highlights, document links,
  document symbols, workspace symbols, folding ranges, selection ranges,
  semantic tokens, hovers, code lens, and rename
- Code actions for creating missing notes, fixing non-breaking spaces,
  generating tables of contents, and moving inline tags to frontmatter
- Vault-confined file-operation planning for safe rename workflows

## Vault And Project Detection

Flavor Grenade detects a project by walking upward from an opened Markdown file.
The strongest signals are:

- `.flavor-grenade.toml`
- `.obsidian/`

When no marker exists, Flavor Grenade can infer the active Markdown flavor from
syntax and path context. Generic Markdown falls back to CommonMark instead of
being treated as Obsidian content.

Example project config:

```toml
markdown_flavor = "gfm"
structured_profiles = ["keep-a-changelog"]
```

Use `structured_profiles = "none"` to disable structured profile behavior.

## Security Model

Flavor Grenade treats workspace files as local user data.

- It does not make network calls during indexing, diagnostics, completion, or
  navigation.
- It returns LSP workspace edits for client approval instead of directly editing
  vault files.
- It rejects non-file root URIs, unsupported URI schemes, prototype-polluting
  JSON-RPC payloads, and paths outside the detected vault boundary.
- It applies parser and scan limits for large or adversarial local files.

## Develop

Install root dependencies:

```bash
bun install
```

Run server checks:

```bash
bun run build
bun run typecheck
bun run lint
bun test
bun run bdd
```

Run VS Code extension checks:

```bash
cd extension
npm install
npm run compile
npm test
npm run test:host
```

## Repository Layout

- `src/`: TypeScript language server
- `extension/`: VS Code extension client and Marketplace package
- `docs/`: server requirements, design, BDD, DDD, ADRs, research, and plans
- `extension/docs/`: extension-specific docs
- `website/`: public documentation website

## License

MIT
