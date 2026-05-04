---
title: flavor-grenade-lsp Architecture Overview
tags: [architecture, lsp, ofm, nestjs]
aliases: [lsp-overview, fg-lsp-architecture]
---

# flavor-grenade-lsp Architecture Overview

`flavor-grenade-lsp` is a Language Server Protocol (LSP) server purpose-built for **Obsidian Flavored Markdown (OFM)**. It provides rich editor intelligence — completions, definitions, diagnostics, hover, rename, and more — for vaults authored in Obsidian's extended Markdown dialect. It is not a general-purpose Markdown LSP; every parse stage, symbol model, and resolution algorithm is designed around OFM semantics.

> [!note] Scope restriction
> `flavor-grenade-lsp` handles **only** OFM. There is no CommonMark-only fallback mode. If a document element is not expressible in OFM terms, it is treated as opaque text. This is a deliberate design constraint, not an oversight.

---

## Relationship to marksman

[marksman](https://github.com/artempyanykh/marksman) is the closest prior art: a Markdown LSP server (F#) that implements wiki-link navigation for CommonMark vaults. `flavor-grenade-lsp` is heavily inspired by marksman's Conn/Oracle reference model and its incremental update strategy, but diverges in several critical ways:

| Dimension | marksman | flavor-grenade-lsp |
|-----------|----------|--------------------|
| Language | F# | TypeScript |
| Framework | None (plain F# modules) | NestJS — full DI container |
| Markdown dialect | CommonMark + wiki-links | OFM only |
| Embed support | No | Yes (`![[file]]`, `![[file#heading]]`) |
| Block ref support | No | Yes (`[[doc#^blockid]]`, `^blockid` anchors) |
| Tag resolution | No | Yes (`#tag`, `#tag/subtag`) |
| Callout support | No | Yes (callout type completions) |
| Frontmatter aliases | No | Yes (`aliases:` → `AliasDef`) |
| Transport | stdio JSON-RPC | stdio JSON-RPC |
| Single-file mode | Yes (file without vault) | Yes |

The Oracle and RefGraph concepts map directly from marksman's mental model. The NestJS module layering replaces marksman's functional module boundaries with injectable, testable services bounded by explicit interfaces.

---

## Transport: stdio JSON-RPC

`flavor-grenade-lsp` communicates exclusively over **stdio**, using the JSON-RPC 2.0 framing specified by the LSP protocol. There is no HTTP server, no WebSocket endpoint, and no port binding. The server is launched as a **child process** by the editor client (Neovim, VS Code, Helix, etc.) via the standard `command` field in the client's LSP configuration.

```text
Editor (client)
    |
    |  spawn child process
    v
flavor-grenade-lsp (server)
    |
    +-- stdin  <-- JSON-RPC requests/notifications from editor
    +-- stdout --> JSON-RPC responses/notifications to editor
    +-- stderr --> debug log output (not part of protocol)
```

This transport model means:

- The server lifetime is tied to the editor session.
- No network configuration or firewall rules are required.
- Multiple editor instances each spawn their own server process; no shared state across processes.
- Log output goes to stderr, which editors typically capture in a dedicated log buffer.

---

## Single-File Mode

When `flavor-grenade-lsp` opens a document and cannot find either a `.obsidian/` directory or a `.flavor-grenade.toml` file in the document's ancestor directories, it falls back to **single-file mode**.

In single-file mode:

- The document is treated as its own isolated vault.
- Cross-document wiki-links cannot resolve and produce `BrokenLink` diagnostics.
- Intra-document features (heading navigation, block anchors, completions within the file) remain fully functional.
- If a vault root is subsequently detected (e.g., the user opens a second file inside a vault), the single-file `VaultFolder` is evicted and replaced by a multi-file folder. See [[concepts/workspace-model]] for the eviction policy.

This mode ensures the server is useful even when launched from a standalone `.md` file outside any vault structure.

---

## Vault Detection

Vault detection runs whenever `workspace/didChangeWorkspaceFolders` is received or when a new document URI is opened without an existing enclosing vault.

Detection precedence:

1. **`.obsidian/` directory** — Primary signal. Obsidian creates this directory at the vault root. Its presence is authoritative.
2. **`.flavor-grenade.toml`** — Secondary signal. A user-managed configuration file at the vault root. Useful for non-Obsidian editors or for overriding vault boundaries.

If neither is found by traversing up to the filesystem root, the document is placed in a single-file `VaultFolder`.

## VS Code OFMarkdown Language Mode

The VS Code extension contributes a client-side language id, `ofmarkdown`, for documents that Flavor Grenade recognizes as Obsidian Flavored Markdown. This is not a separate parser mode in the server. The server remains OFM-only; `ofmarkdown` is an editor identity used by VS Code settings, snippets, keybindings, grammar contributions, and semantic token targeting.

Assignment is dynamic:

1. `.md` files open as VS Code's built-in `markdown`.
2. The extension checks for an ancestor `.obsidian/` directory as a fast positive signal.
3. After the server starts, the extension asks `flavorGrenade/documentMembership` whether the URI belongs to a vault/index.
4. Qualifying `markdown` documents are promoted to `ofmarkdown` using VS Code's language assignment API.

The extension's LanguageClient listens to both `markdown` and `ofmarkdown` documents so LSP features continue across the close/open event VS Code emits during language reassignment.

---

## Key Design Principles

### 1. Immutable Documents

`OFMDoc` is an immutable value type. When the editor sends `textDocument/didChange`, a **new** `OFMDoc` is constructed (with the updated text, re-parsed index, and new version number) and the old one is discarded. No in-place mutation occurs anywhere in the document lifecycle.

This makes the document state trivially threadsafe and allows the previous state to be compared against the new state to compute diffs without locking.

### 2. Incremental Connection Updates

`RefGraph.update(oracle, symDiff)` receives only the **changed symbols** from the last document version, not the full vault symbol set. It surgically adds, removes, or reroutes edges in the bipartite ref-to-def graph. Full rebuilds (`RefGraph.mk`) are reserved for vault initialization and file deletion events.

This keeps diagnostic republishing latency sub-10ms for typical vaults (< 5000 notes). See [[architecture/data-flow]] for the full change pipeline.

### 3. NestJS Dependency Injection

Each logical subsystem is a NestJS module with explicit `imports`, `providers`, and `exports`. The DI container enforces the dependency graph at startup — a `FeatureModule` that incorrectly imports from a higher-layer module will fail to compile. This replaces the informal module boundary conventions of a plain TypeScript project with a machine-checked constraint.

Bounded context boundaries in the DDD sense are enforced by module export surfaces. A `DocumentModule` consumer sees only `OFMDoc`, `OFMIndex`, and `DocId` — never the parser's internal CST node types. See [[architecture/layers]] for the full module stack and [[ddd/bounded-contexts]] for the DDD analysis.

### 4. OFM-Exclusive Parse Pipeline

The parse pipeline never degrades to CommonMark-only semantics. Every stage is OFM-aware:

- Ignore regions cover Obsidian comment syntax (`%%...%%`), Templater blocks, and math environments.
- Wiki-link tokenization happens before CommonMark inline parsing so that bracket sequences are never mis-parsed as CommonMark link syntax.
- Block anchors (`^id`) are parsed and promoted to first-class `BlockAnchorDef` symbols.
- Callout syntax (`> [!type]`) is recognized at the blockquote parse stage.

See [[concepts/document-model]] for the 8-stage pipeline and [[concepts/ofm-syntax]] for the full element taxonomy.

---

## Project Entry Point

```text
src/main.ts
  └─ bootstrap()
       └─ NestFactory.createApplicationContext(LspModule)
            └─ LspModule
                 ├─ imports: [PathModule, ConfigModule, ParserModule,
                 │            DocumentModule, VaultModule, ReferenceModule]
                 └─ providers: [LspServer, RequestRouter, CapabilityNegotiator]
                      └─ LspServer.start()
                           └─ binds stdin/stdout → JSON-RPC codec
```

`bootstrap()` in `src/main.ts` is the sole entry point. It creates a NestJS application context (not an HTTP application), resolves the `LspServer` provider, and calls `LspServer.start()`. From that point, the server is event-driven: it reads JSON-RPC frames from stdin and dispatches to the appropriate handler.

---

## Cross-References

- [[architecture/layers]] — NestJS module dependency order and responsibility table
- [[architecture/data-flow]] — Step-by-step lifecycle of document change and completion flows
- [[ddd/bounded-contexts]] — Full DDD analysis of the five bounded contexts
- [[concepts/document-model]] — OFMDoc structure and parse pipeline
- [[concepts/connection-graph]] — RefGraph and Oracle patterns
- [[concepts/workspace-model]] — VaultFolder and Workspace composition
- [[features/ofmarkdown-language-mode]] — VS Code language mode assignment
- [[adr/ADR016-ofmarkdown-language-mode]] — Dynamic OFMarkdown language mode decision
