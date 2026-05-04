---
title: VS Code Extension Design — Flavor Grenade
tags: [design, vscode, extension, lsp, publishing]
aliases: [vscode-extension-spec, extension-design]
created: 2026-04-21
status: draft
---

# VS Code Extension Design — Flavor Grenade

## Purpose

Design a VS Code extension that wraps the existing `flavor-grenade-lsp` server, bundling it as a platform-specific compiled binary so users get full Obsidian Flavored Markdown intelligence with zero separate installation.

---

## Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Distribution | Platform-specific VSIXs | Offline install, fast startup, binary guaranteed present. See [[ADR015-platform-specific-vsix]]. |
| Server binary | `bun build --compile` output | Zero runtime deps, fast startup with `--bytecode`, cross-compilation from Linux. |
| Client library | `vscode-languageclient@^9.0.1` | Current stable. Executable ServerOptions with stdio transport. |
| Transport | stdio | Already decided in [[ADR001-stdio-transport]]. All editors support it. |
| Bundler (client) | esbuild | Fast, single-file output, standard for VS Code extensions. |
| Binary resolution | 2-tier: user setting → bundled | Platform-specific VSIXs guarantee binary is present. PATH/env tiers unnecessary. |
| Activation | `onLanguage:markdown`, `onLanguage:ofmarkdown` | Lazy — activates for initial Markdown opens and remains active after OFMarkdown promotion. |
| Language mode | Dynamic `ofmarkdown` assignment | Promote only vault/index Markdown documents. See [[ADR016-ofmarkdown-language-mode]]. |
| Release trigger | Manual tags (`ext-v*`) | Decoupled from server releases until extension stabilizes. |
| Engine floor | `^1.81.0` | Current extension support floor. |

---

## Extension Identity

| Field | Value |
|---|---|
| `name` | `flavor-grenade` |
| `displayName` | Flavor Grenade — Obsidian Markdown Support |
| `publisher` | `alisonaquinas` (display name: Alison Aquinas) |
| `license` | MIT |
| `engines.vscode` | `^1.81.0` |
| `keywords` | obsidian, markdown, wiki-links, lsp, zettelkasten, llm-wiki |

---

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│  VS Code Extension Host (Node.js)                   │
│                                                     │
│  ┌───────────────┐    ┌──────────────────────────┐  │
│  │  extension.ts  │───>│  vscode-languageclient   │  │
│  │  activate()    │    │  LanguageClient v9.x     │  │
│  │  deactivate()  │    │  (Executable + stdio)    │  │
│  └──────┬────────┘    └───────────┬──────────────┘  │
│         │                         │ spawn + stdio    │
│  ┌──────▼────────┐               │                  │
│  │ StatusBar      │               │                  │
│  │ Widget         │               │                  │
│  └───────────────┘               │                  │
│                                   │                  │
│  ┌───────────────┐               │                  │
│  │ Commands       │               │                  │
│  │ (restart, etc) │               │                  │
│  └───────────────┘               │                  │
└───────────────────────────────────┼──────────────────┘
                                    │
                    ┌───────────────▼──────────────────┐
                    │  server/flavor-grenade-lsp[.exe]  │
                    │  (Bun-compiled binary, stdio)     │
                    │  ┌────────────────────────────┐  │
                    │  │  Existing LSP server code   │  │
                    │  │  (NestJS, OFM parser,       │  │
                    │  │   vault index, RefGraph)     │  │
                    │  └────────────────────────────┘  │
                    └──────────────────────────────────┘
```

The extension client is thin (~200 lines). It resolves the server binary path, configures `LanguageClient`, wires up a status bar widget and palette commands, and manages lifecycle. All language intelligence lives in the server.

No server code ships in the extension JS bundle. The binary lives at `server/flavor-grenade-lsp[.exe]` relative to the extension root.

The client also owns VS Code language mode assignment. It contributes `ofmarkdown`, detects qualifying open documents, and uses the VS Code API to promote only vault/index Markdown documents. The server remains authoritative for membership via `flavorGrenade/documentMembership`.

---

## VSIX Contents

```text
flavor-grenade-linux-x64-0.1.0.vsix
├── extension/
│   ├── dist/
│   │   └── extension.js          # esbuild-bundled client (~50KB)
│   ├── server/
│   │   └── flavor-grenade-lsp    # Bun-compiled binary (~50-80MB)
│   ├── package.json
│   ├── README.md
│   ├── LICENSE
│   ├── CHANGELOG.md
│   └── images/
│       └── icon.png              # 256x256 PNG
└── [Content_Types].xml
```

Everything else excluded via `.vscodeignore`.

---

## Extension Client Design

### Binary Resolution (2-tier)

1. **User setting** `flavorGrenade.server.path` — escape hatch for developers building from source.
2. **Bundled binary** — `server/flavor-grenade-lsp[.exe]` relative to `context.extensionUri`. Default for all normal users.

```typescript
function resolveServerPath(context: ExtensionContext): string {
    const custom = workspace.getConfiguration('flavorGrenade')
        .get<string>('server.path');
    if (custom) return custom;

    const bin = process.platform === 'win32'
        ? 'flavor-grenade-lsp.exe'
        : 'flavor-grenade-lsp';
    return Uri.joinPath(context.extensionUri, 'server', bin).fsPath;
}
```

No PATH fallback. No env var. No download. Platform-specific VSIXs guarantee the binary is present.

### LanguageClient Configuration

```typescript
// Executable form — stdio is the default transport when using `command`.
// No explicit `transport` property needed (TransportKind is for NodeModule form only).
const serverOptions: ServerOptions = {
    run:   { command: serverPath },
    debug: { command: serverPath },
};

const clientOptions: LanguageClientOptions = {
    documentSelector: [
        { scheme: 'file', language: 'markdown' },
        { scheme: 'file', language: 'ofmarkdown' },
    ],
    synchronize: {
        fileEvents: workspace.createFileSystemWatcher('**/*.md'),
    },
    initializationOptions: {
        linkStyle: config.get('linkStyle'),
        completionCandidates: config.get('completion.candidates'),
        diagnosticsSuppress: config.get('diagnostics.suppress'),
    },
};
```

- Targets `markdown` and `ofmarkdown` files with `file://` scheme only.
- `initializationOptions` passes user config to the server at startup.
- `fileEvents` watcher notifies the server about file creates/deletes/renames outside the editor.

### Status Bar Widget

Listens for the custom `flavorGrenade/status` notification:

```typescript
client.onNotification('flavorGrenade/status', (params) => {
    // params: { state, vaultCount, docCount, message? }
    switch (params.state) {
        case 'initializing': statusItem.text = '$(loading~spin) FG: Starting...';  break;
        case 'indexing':     statusItem.text = '$(loading~spin) FG: Indexing...';   break;
        case 'ready':        statusItem.text = `$(check) FG: ${params.docCount} docs`; break;
        case 'error':        statusItem.text = '$(error) FG: Error';                break;
    }
});
```

Uses `StatusBarItem` API with codicon icons. Shows doc count when ready. Click opens output channel.

### OFMarkdown Language Mode

The extension contributes a custom VS Code language id:

```json
{
  "id": "ofmarkdown",
  "aliases": ["OFMarkdown", "Obsidian Flavored Markdown"],
  "configuration": "./language-configuration.json"
}
```

The language contribution intentionally does **not** include `.md` in `extensions`; built-in Markdown remains the default for generic `.md` files. The extension promotes open documents with `vscode.languages.setTextDocumentLanguage(document, 'ofmarkdown')` only after a positive detection signal.

Detection signals:

- Ancestor `.obsidian/` directory found by the extension for fast startup.
- Server response from `flavorGrenade/documentMembership` showing the document is indexed or belongs to a vault.

Safety rules:

- Promote only `file://` documents currently in `markdown`.
- Preserve any user-selected language id other than `markdown` or `ofmarkdown`.
- Track in-flight assignments by URI because VS Code closes and reopens a document when its language id changes.
- Do not restart the LanguageClient due solely to the language id transition.

The `ofmarkdown` language must use Markdown-compatible grammar/configuration so the user does not lose baseline Markdown highlighting after promotion. OFM-specific highlighting continues through semantic tokens.

### Commands

| Command ID | Palette Label | Action |
|---|---|---|
| `flavorGrenade.restartServer` | Flavor Grenade: Restart Server | `client.restart()` |
| `flavorGrenade.rebuildIndex` | Flavor Grenade: Rebuild Index | Sends `workspace/executeCommand` → `flavorGrenade.rebuildIndex` |
| `flavorGrenade.showOutput` | Flavor Grenade: Show Output | `client.outputChannel.show()` |

### Lifecycle

- **`activate()`**: resolve binary → create client → start client → register status bar + commands → push all to `context.subscriptions`.
- **`deactivate()`**: `return client?.stop()` — sends LSP `shutdown` + `exit`.
- **Crash recovery**: `LanguageClient` default error handler restarts up to 4 times within 3 minutes. No custom handler needed.
- **Config changes**: `onDidChangeConfiguration` watches for `flavorGrenade.server.path` changes and triggers `client.restart()`. Other settings propagate via restart since the server reads them from `initializationOptions`.

---

## Extension Manifest

### Core Fields

```json
{
  "name": "flavor-grenade-lsp",
  "displayName": "Flavor Grenade LSP — Obsidian Markdown Support",
  "description": "Language intelligence for Obsidian Flavored Markdown: wiki-links, tags, embeds, block references, and more.",
  "version": "0.1.0",
  "publisher": "alisonaquinas",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/alisonaquinas/flavor-grenade-lsp"
  },
  "engines": { "vscode": "^1.81.0" },
  "categories": ["Programming Languages", "Linters"],
  "keywords": ["obsidian", "markdown", "wiki-links", "lsp", "zettelkasten", "llm-wiki"],
  "extensionKind": ["workspace"],
  "main": "./dist/extension.js",
  "icon": "images/icon.png",
  "activationEvents": ["onLanguage:markdown", "onLanguage:ofmarkdown"]
}
```

> **Note:** `extensionKind: ["workspace"]` means the extension runs on the workspace host, not the local UI side. This is required because the server binary must execute on the machine where the vault files live. In VS Code Remote scenarios the extension runs on the remote host alongside the files.
>
> `activationEvents` is listed explicitly for clarity. `onLanguage:markdown` starts detection for ordinary `.md` opens; `onLanguage:ofmarkdown` keeps the extension active when a document is already in OFMarkdown mode.

### Language Contributions

```json
{
  "languages": [
    {
      "id": "ofmarkdown",
      "aliases": ["OFMarkdown", "Obsidian Flavored Markdown"],
      "configuration": "./language-configuration.json"
    }
  ],
  "grammars": [
    {
      "language": "ofmarkdown",
      "scopeName": "text.html.markdown.ofm",
      "path": "./syntaxes/ofmarkdown.tmLanguage.json",
      "embeddedLanguages": {
        "meta.embedded.block.frontmatter": "yaml"
      }
    }
  ]
}
```

Do not add `.md` to the language contribution. Dynamic assignment is required by [[ADR016-ofmarkdown-language-mode]].

### Configuration Contributions

| Setting | Type | Default | Description |
|---|---|---|---|
| `flavorGrenade.server.path` | `string` | `""` | Custom path to server binary. Leave empty to use bundled. |
| `flavorGrenade.linkStyle` | `string` enum: `file-stem`, `relative-path` | `file-stem` | Wiki-link completion style. |
| `flavorGrenade.completion.candidates` | `number` | `50` | Max completion items returned. |
| `flavorGrenade.diagnostics.suppress` | `string[]` | `[]` | Diagnostic codes to suppress (e.g., `["AmbiguousLink"]`). |
| `flavorGrenade.trace.server` | `string` enum: `off`, `messages`, `verbose` | `off` | Trace LSP communication in output channel. |

### Command Contributions

```json
[
  { "command": "flavorGrenade.restartServer", "title": "Flavor Grenade: Restart Server" },
  { "command": "flavorGrenade.rebuildIndex",  "title": "Flavor Grenade: Rebuild Index" },
  { "command": "flavorGrenade.showOutput",    "title": "Flavor Grenade: Show Output" }
]
```

### Capabilities

```json
{
  "untrustedWorkspaces": {
    "supported": false,
    "description": "Flavor Grenade spawns a language server binary and cannot run in Restricted Mode."
  },
  "virtualWorkspaces": {
    "supported": false,
    "description": "Flavor Grenade requires file-system access for vault indexing."
  }
}
```

Both `false`. The server needs real filesystem access for vault scanning and file watching.

### `.vscodeignore`

```text
.github/**
src/**
docs/**
node_modules/**
*.ts
!dist/**
tsconfig.json
.eslintrc*
.prettierrc*
**/*.test.*
**/__tests__/**
.vscode/**
.gitignore
package-lock.json
```

Only `dist/extension.js`, `server/flavor-grenade-lsp[.exe]`, `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `images/icon.png` ship.

### Build Scripts

> **Note:** The extension client uses npm (standard Node/VS Code ecosystem), while the server binary is compiled with Bun. This split is intentional — `vsce` expects npm-compatible `package.json` scripts, and the extension client has no Bun-specific dependencies.

```json
{
  "scripts": {
    "vscode:prepublish": "npm run build:extension",
    "build:extension": "esbuild src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js --minify --sourcemap",
    "watch": "esbuild src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js --sourcemap --watch"
  }
}
```

> **Note:** `vscode:prepublish` intentionally runs only `build:extension`, not `build:server`. The server binary is cross-compiled separately — in CI by the matrix job (with `--target=$BUN_TARGET --bytecode`), and locally by the developer before running `vsce package`. This avoids a dependency on the `$BUN_TARGET` environment variable in the generic prepublish hook.

`$BUN_TARGET` is injected by the CI matrix job (e.g., `bun-linux-x64`). For local development builds, omit `--target` to compile for the host platform:

```bash
bun build --compile --minify ./src/server/main.ts --outfile server/flavor-grenade-lsp
```

---

## CI/CD — Platform Build Matrix

### Target Matrix

| VS Code target | Bun `--target` | Runner | Binary name |
|---|---|---|---|
| `linux-x64` | `bun-linux-x64` | `ubuntu-latest` | `flavor-grenade-lsp` |
| `linux-arm64` | `bun-linux-arm64` | `ubuntu-latest` | `flavor-grenade-lsp` |
| `alpine-x64` | `bun-linux-x64-musl` | `ubuntu-latest` | `flavor-grenade-lsp` |
| `darwin-x64` | `bun-darwin-x64` | `ubuntu-latest` | `flavor-grenade-lsp` |
| `darwin-arm64` | `bun-darwin-arm64` | `ubuntu-latest` | `flavor-grenade-lsp` |
| `win32-x64` | `bun-windows-x64` | `ubuntu-latest` | `flavor-grenade-lsp.exe` |
| `win32-arm64` | `bun-windows-arm64` | `ubuntu-latest` | `flavor-grenade-lsp.exe` |

All cross-compiled on `ubuntu-latest`. No macOS/Windows runners needed.

### Pipeline Flow

```text
Tag push (ext-v0.1.0)
    │
    ▼
┌─────────────────────────────────┐
│  Matrix Job (x7 targets)        │
│                                 │
│  1. checkout                    │
│  2. setup-bun                   │
│  3. setup-node (for vsce)       │
│  4. npm ci (extension deps)     │
│  5. esbuild extension client    │
│  6. bun build --compile         │
│     --minify --bytecode         │
│     --target=$BUN_TARGET        │
│     -> server/flavor-grenade-lsp│
│  7. vsce package                │
│     --target=$VSCE_TARGET       │
│  8. upload VSIX artifact        │
└──────────────┬──────────────────┘
               │ all 7 complete
               ▼
┌─────────────────────────────────┐
│  Publish Job                    │
│                                 │
│  1. download all VSIX artifacts │
│  2. vsce publish --packagePath  │
│     *.vsix (all 7 at once)     │
└─────────────────────────────────┘
```

### Design Choices

- **Tag-triggered only.** Tags matching `ext-v*` trigger the workflow. No publishing on push to `main` or `develop`.
- **Build and publish are separate jobs.** Matrix runs in parallel; publish waits for all to succeed. If any platform fails, nothing publishes.
- **`VSCE_PAT` as repository secret.** Single secret, scoped to Marketplace `Manage`.
- **Separate workflow.** New `extension-release.yml`, independent from existing `ci.yml` and `release.yml`. The LSP server and extension have independent release cycles.
- **Manual tags for now.** Tag `ext-v0.1.0` when ready. Migrate to release-please component once extension stabilizes.

---

## Scope Boundaries

### In Scope (v1)

- Thin LanguageClient wrapper over bundled binary
- Status bar widget (vault state, doc count)
- Three palette commands (restart, rebuild index, show output)
- Five configuration settings (server path, link style, completion candidates, diagnostics suppress, trace)
- Dynamic OFMarkdown language mode for vault/index documents
- Platform-specific VSIXs for 7 targets
- CI/CD workflow for tag-triggered multi-platform publishing

### Out of Scope (v1)

- Web extension (`browser` entry point) — requires filesystem access
- Webviews, tree views, custom editors
- Obsidian vault sidebar
- Semantic token color theme contributions (defer to v1.1 — requires theme testing)
- Automatic binary download fallback
- release-please integration for extension releases
- macOS code signing
- VS Code command wrappers for `flavorGrenade.insertBlockAnchor` and `flavorGrenade.openLinkedNote` — these server-side commands (documented in [[design/api-layer]]) require cursor-context integration that duplicates existing go-to-definition behavior. Deferred to v1.1 after evaluating whether direct LSP features cover the use case.
- Updating `editors/vscode/settings.json` — the existing reference file documents server-only settings. Extension-specific settings (`server.path`, `trace.server`) will be documented in the extension's own README and `contributes.configuration`.

---

## Cross-References

- [[ADR001-stdio-transport]] — Transport decision
- [[ADR015-platform-specific-vsix]] — Distribution strategy decision
- [[ADR016-ofmarkdown-language-mode]] — Dynamic OFMarkdown language mode decision
- [[architecture/overview]] — Server architecture
- [[design/api-layer]] — LSP method catalog and capability matrix
- [[features/ofmarkdown-language-mode]] — OFMarkdown language mode feature spec
- [[research/vscode-extension-publishing]] — Publishing research report
