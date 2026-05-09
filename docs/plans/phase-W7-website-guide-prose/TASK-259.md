---
id: "TASK-259"
title: "Advanced Article: Configuration Model"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, advanced, article]
aliases: ["TASK-259"]
---

# Advanced Article: Configuration Model

> [!INFO] `TASK-259` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain configuration sources, defaults, vault behavior, supported document
  extensions, and indexing boundaries.
- Distinguish public extension configuration from server internals.
- Include examples for users who need predictable behavior in generated docs or
  large Obsidian Vaults.

## Asset Scope

- Include a `.flavor-grenade.toml` or settings snippet if supported by the
  current implementation.
- Include a configuration table with setting, purpose, and default behavior.

## Draft Article Copy

# Configuration Model

Flavor Grenade has two configuration surfaces:

- VS Code extension settings, used by the supported packaged extension.
- Vault-local marker/config files, used by the language server while indexing a
  vault.

Most users should configure Flavor Grenade through VS Code settings and vault
layout. Direct LSP clients can pass the same server options through
`initializationOptions`, but they must also handle server startup, transport,
and workspace root selection themselves.

## Supported Configuration Surfaces

| Surface | Applies to | Use for | Notes |
|---|---|---|---|
| VS Code setting `flavorGrenade.linkStyle` | VS Code extension | Wiki-link completion text | Default: `file-stem`. |
| VS Code setting `flavorGrenade.completion.candidates` | VS Code extension | Completion list cap | Default: `50`. Non-positive or invalid direct-LSP values fall back to default. |
| VS Code setting `flavorGrenade.diagnostics.suppress` | VS Code extension | Diagnostic-code suppression | Default: `[]`. Use exact diagnostic codes. |
| VS Code setting `flavorGrenade.trace.server` | VS Code extension | Language-client trace logging | Default: `off`. This is a client trace setting, not a server behavior setting. |
| User or machine setting `flavorGrenade.server.path` | VS Code extension | Custom server binary for development or local testing | Workspace values are ignored for safety. Empty means use the bundled server. |
| `.obsidian/` directory | Vault detection | Obsidian vault marker | Preferred when present at the detected root. |
| `.flavor-grenade.toml` file | Vault detection and vault scan options | Non-Obsidian Flavor Grenade vault marker, document extension list | Only documented keys are supported. |
| `.gitignore` and `.ignore` | Vault scan | Skip generated or unwanted paths | Patterns are evaluated against vault-relative paths. `.obsidian/` is always skipped. |
| `.obsidian/app.json` `attachmentFolderPath` | Attachment behavior | Preferred attachment folder hint | Used when present and readable. Missing or invalid values are ignored. |

## VS Code Settings

The VS Code extension is the supported install path. It packages the server,
starts it in supported file-system workspaces, and translates public settings
into LSP initialization options.

Example user settings:

```json
{
  "flavorGrenade.linkStyle": "file-stem",
  "flavorGrenade.completion.candidates": 50,
  "flavorGrenade.diagnostics.suppress": [],
  "flavorGrenade.trace.server": "off"
}
```

`flavorGrenade.server.path` is intentionally separate from normal vault
behavior. It is an escape hatch for a custom binary. Set it at user or machine
scope. Workspace-scoped values are ignored so a repository cannot silently
replace the server executable.

## Link Completion Style

`flavorGrenade.linkStyle` controls the text inserted for note completions.

| Value | Inserted shape | When to use |
|---|---|---|
| `file-stem` | `[[Note Name]]` | Default Obsidian-style links where note names are unique enough. |
| `file-path-stem` | `[[folder/Note Name]]` | Vaults with repeated note names in different folders. |
| `title-slug` | Derived from the note title/frontmatter where available | Generated docs or publishing workflows that prefer title-like targets. |

Direct LSP clients may still send the legacy value `relative-path`; the server
normalizes it to `file-path-stem`. New client configuration should use
`file-path-stem`.

## Vault Marker and Document Extensions

Flavor Grenade detects a vault by walking upward from the initialized root and
looking for markers:

1. `.obsidian/`
2. `.flavor-grenade.toml`

If both markers exist at the same level, `.obsidian/` wins. If no marker is
found, the server runs in single-file mode instead of doing a recursive vault
scan.

`.flavor-grenade.toml` can mark a non-Obsidian folder as a Flavor Grenade vault
and can declare extra document extensions for the initial vault scan:

```toml
[vault]
extensions = [".md", ".markdown"]
```

The default document extension set is `.md`. Extension values are normalized to
lowercase and may be written with or without the leading dot.

Current limit: the initial scan uses the configured extension list, but the
VS Code extension and file watcher are Markdown-focused. If you change files
with custom extensions while the server is already running, run **Flavor
Grenade: Rebuild Index** before relying on vault-wide results.

## Indexing Boundaries

Flavor Grenade indexes files inside the detected vault root only. It uses
vault-relative paths internally, and document identifiers strip the Markdown
extension:

| File path inside vault | DocId used by the server |
|---|---|
| `Notes/Intro.md` | `Notes/Intro` |
| `daily/2026-05-09.md` | `daily/2026-05-09` |

The vault scan skips paths matched by `.gitignore` or `.ignore`. It also skips
`.obsidian/` even if your ignore files do not mention it.

Use ignore files for large generated folders:

```gitignore
dist/
site-output/
generated/
*.tmp.md
```

The server keeps parsed documents in the vault index. That index is the source
of truth for completions, diagnostics, references, rename, tags, headings, and
attachment lookup.

## Direct LSP Initialization

Direct LSP use is advanced integration. The server currently speaks LSP over
stdio with standard `Content-Length` framing. A non-VS Code client must start
the process, send `initialize`, send `initialized`, and provide a `file://`
`rootUri` or `workspaceFolders` entry if vault indexing is expected.

Example initialization options:

```json
{
  "initializationOptions": {
    "linkStyle": "file-stem",
    "completionCandidates": 50,
    "diagnosticsSuppress": []
  }
}
```

Do not assume VS Code setting names are server option names. VS Code settings
use public `flavorGrenade.*` keys. The server receives compact
`initializationOptions` keys.

## Definition of Done

- [ ] Article route exists and is linked from Advanced Usage hub and dropdown.
- [ ] Article documents supported configuration only.
- [ ] Config snippet or table is present.
- [ ] Route metadata, sitemap, and tests include the article.
