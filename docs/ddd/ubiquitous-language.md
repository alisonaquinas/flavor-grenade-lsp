---
title: "Ubiquitous Language — flavor-grenade-lsp"
tags:
  - ddd/ubiquitous-language
  - ddd/glossary
  - architecture
aliases:
  - glossary
  - ubiquitous language
  - domain glossary
---

# Ubiquitous Language — flavor-grenade-lsp

This glossary is the single source of truth for terminology used across all bounded contexts. Every term defined here must be used consistently in code, comments, tests, and documentation. When a term has a different meaning in a different bounded context, the per-BC section qualifier is noted in the Definition column.

See also: [[bounded-contexts]], [[ddd/vault/domain-model]], [[ddd/document-lifecycle/domain-model]], [[ddd/reference-resolution/domain-model]], [[ddd/lsp-protocol/domain-model]], [[ddd/config/domain-model]].

> [!NOTE]
> Terms are context-qualified where the same word means something different in different bounded contexts. Unqualified terms are shared across all contexts.

---

## Core Domain Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **Vault** | BC4 Vault & Workspace | An Obsidian workspace — a directory that contains a `.obsidian/` subdirectory (or a `.flavor-grenade.toml` file). A vault is the natural unit of reference resolution: wikilinks are resolved within a single vault. |
| **VaultRoot** | BC1 Path & Identity | The absolute filesystem path to the root directory of a Vault. Branded string type; never contains a trailing separator. |
| **VaultPath** | BC1 Path & Identity | A path relative to a `VaultRoot`, using forward slashes, no leading slash. Example: `notes/2024/foo.md`. The stable, human-readable address of a document within its vault. |
| **AbsPath** | BC1 Path & Identity | An absolute filesystem path. Branded string; used internally for I/O. Not stored in domain objects — always converted to `VaultPath` at the vault boundary. |
| **RelPath** | BC1 Path & Identity | A relative filesystem path that has not yet been resolved against a `VaultRoot`. Ephemeral; used during vault scanning. |
| **DocId** | BC1 Path & Identity | The stable identity of a document. Contains `{ uri: string; path: VaultPath }`. Two `DocId` values are equal iff their `VaultPath` strings are equal under the current platform's path comparison rules. |
| **Slug** | BC1 Path & Identity | A URL-safe identifier derived from a file stem by lowercasing, replacing spaces with hyphens, and stripping non-alphanumeric characters. Used in completion candidate generation. |
| **WikiEncoded** | BC1 Path & Identity | A wikilink-encoded string following Obsidian's rules: spaces encoded as `%20` in URIs but preserved as spaces in wikilink display text. Distinct from URL encoding. |

---

## Document Lifecycle Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **OFMDoc** | BC2 Document Lifecycle | The primary aggregate representing a single Obsidian Flavored Markdown document. Encapsulates raw text, parsed structure (CST + AST), derived index, and version tracking. Identity: `DocId`. |
| **OFMIndex** | BC2 Document Lifecycle | A derived projection of an `OFMDoc`'s parsed content, containing typed collections of headings, wikilinks, embed links, block anchors, tags, frontmatter, callouts, math blocks, and comments. Rebuilt atomically whenever the document text changes. |
| **ParsePipeline** | BC2 Document Lifecycle | The ordered chain of parser stages that transforms raw markdown text into a fully indexed `OFMDoc`. Stages: tokenize → CST → ignore-type placeholders → AST → index. |
| **CST** | BC2 Document Lifecycle | Concrete Syntax Tree — the direct output of the tree-sitter parser. Preserves every byte of the source including whitespace and comments. |
| **AST** | BC2 Document Lifecycle | Abstract Syntax Tree — a cleaned, typed tree derived from the CST with OFM extension nodes resolved (wikilinks, embeds, block anchors, etc.) and trivia stripped. |
| **Structure** | BC2 Document Lifecycle | The pair `{ cst: CST; ast: AST }` produced by running the `ParsePipeline`. Stored inside `OFMDoc`; replaced atomically on text change. |
| **WikilinkNode** | BC2 Document Lifecycle | An AST node representing a `[[target]]` or `[[target\|display]]` wikilink. Contains target text, display text (if present), and source range. |
| **EmbedNode** | BC2 Document Lifecycle | An AST node representing a `![[target]]` embed. May embed a document, heading, or block. |
| **BlockAnchor** | BC2 Document Lifecycle | A `^anchor-id` marker placed at the end of a paragraph or list item, making that block addressable by block references. |
| **CalloutBlock** | BC2 Document Lifecycle | An Obsidian-flavored blockquote of the form `> [!TYPE] Optional Title`. Parsed as a first-class node in the OFM AST. |
| **FrontmatterBlock** | BC2 Document Lifecycle | A YAML block at the very start of a document delimited by `---`. Contains document metadata including title, aliases, and tags. Parsed before the rest of the document. |
| **MathNode** | BC2 Document Lifecycle | An AST node for a LaTeX math block (`$$...$$`) or inline math (`$...$`). Captured in `OFMIndex.mathBlocks` for diagnostics and symbol lookup. |
| **CommentNode** | BC2 Document Lifecycle | An AST node for an HTML or Obsidian comment (`%%...%%`). Captured in `OFMIndex.comments`; not rendered. |

---

## Reference Resolution Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **AliasDef** | BC3 Reference Resolution | A `Def` created from an `aliases:` frontmatter entry. Enables wiki-links to target a document by its alias rather than its file stem. |
| **BlockAnchorDef** | BC3 Reference Resolution | A `Def` created from a `^blockid` token at the end of a block-level line. Document-local scope. |
| **BlockRef** | BC3 Reference Resolution | A reference expressed as `[[target#^anchor-id]]` or `![[target#^anchor-id]]`. First-class ref type. Target must be a `BlockAnchor` `Def`; broken block refs generate `Unresolved` entries and diagnostics. |
| **BrokenLink** | BC3 Reference Resolution | A `CrossDoc` ref that resolves to no `DocDef` or `AliasDef` in the vault. Produces diagnostic FG001. |
| **CrossBlock** | BC3 Reference Resolution | A wiki-link targeting a specific block anchor in another document, e.g. `[[doc#^blockid]]`. Distinct from `CrossDoc` (file-only) and `IntraBlock` (same-file block ref). |
| **CrossDoc** | BC3 Reference Resolution | A `CrossRef` targeting a document as a whole (no fragment). The minimal unit of cross-document linkage. |
| **CrossRef** | BC3 Reference Resolution | A ref whose target is in a different document. Requires cross-document lookup via Oracle. |
| **CrossSection** | BC3 Reference Resolution | A `CrossRef` that targets a specific heading or block within another document (e.g., `[[other-doc#section]]`). Always accompanied by a synthetic `CrossDoc` ref to the target document, so that title changes invalidate all section links. |
| **Def** | BC3 Reference Resolution | A location that can serve as the target of a reference. Types of Def: document title (implicit), heading (`##`), block anchor (`^id`), frontmatter alias. A single document may have multiple `Def` values. |
| **Dest** | BC3 Reference Resolution | The resolved destination of a `Ref`: `{ doc: DocId; def: Def }`. The target location a go-to-definition action navigates to. |
| **DocDef** | BC3 Reference Resolution | A `Def` representing the document itself, keyed by its file stem. Created once per indexed document. |
| **EmbedRef** | BC3 Reference Resolution | A reference expressed as `![[target]]`. First-class ref type in flavor-grenade (not present in marksman). Resolved identically to `WikiRef` but carries embed semantics for diagnostics. |
| **HeaderDef** | BC3 Reference Resolution | A `Def` created from a heading token. Enables `[[doc#heading]]` references. |
| **IntraRef** | BC3 Reference Resolution | A ref whose target is within the same document (e.g., `[[#Heading]]`). Resolved purely against the document's own `OFMIndex`. |
| **lastTouched** | BC3 Reference Resolution | A timestamp field on index entries recording when a document was last re-parsed. Used to detect staleness during vault scans. |
| **LinkDefDef** | BC3 Reference Resolution | A `Def` created when a document defines a named link definition in Markdown reference-link style. Rare but indexed for completeness. |
| **Oracle** | BC3 Reference Resolution | The domain service and anti-corruption layer that mediates between `RefGraph` and `VaultIndex`. `RefGraph` asks the Oracle to resolve a ref to a set of candidate scopes (`DocId[]`) and then to locate `Def` values within a scope. The Oracle speaks `RefGraph`'s language, not `VaultIndex`'s. |
| **Ref** | BC3 Reference Resolution | A reference site in a document — a place that points to a `Def`. Subtypes: `WikiRef`, `EmbedRef`, `BlockRef`, `TagRef`. |
| **RefGraph** | BC3 Reference Resolution | The aggregate that is the consistency boundary for all reference and definition data across a vault. Owns the resolved-ref → def edge map, the unresolved set, and the reverse backlinks index. Rebuilt or incrementally updated whenever documents change. |
| **Scope** | BC3 Reference Resolution | Either `Doc(DocId)` (document-local) or `Global`. Scopes partition the symbol space so that block anchors (local) and file-level definitions (global) are stored separately. |
| **ScopedSym** | BC3 Reference Resolution | A `Sym` paired with the `Scope` in which it lives; the atomic unit of the `RefGraph`. |
| **Sym** | BC3 Reference Resolution | Any symbol extracted from a document: either a definition site (Def) or a usage site (Ref) or a tag. The union type of all indexable elements. |
| **SymbolDiff** | BC3 Reference Resolution | The set of `ScopedSym`s added and removed by one document change; the input to `RefGraph.update`. Produced by diffing the symbol sets from two consecutive parses of the same document. |
| **SymbolMap** | BC3 Reference Resolution | The per-document map from symbol key to `ScopedSym` set. Passed to `RefGraph.mk` as the initial state of the symbol graph. |
| **TagRef** | BC3 Reference Resolution | A `#tag` or `#nested/tag` usage in document body. Resolved against the tag `Def` set across the vault. |
| **TitleDef** | BC3 Reference Resolution | A `Def` created from the first H1 heading in a document, used as an alternative target key alongside the file stem. |
| **Unresolved** | BC3 Reference Resolution | A `Ref` for which no matching `Def` could be found after full Oracle resolution. Stored in `RefGraph.unresolvedRefs`. Surfaced as LSP diagnostics when enabled. |
| **WikiRef** | BC3 Reference Resolution | A reference expressed as `[[target]]` or `[[target\|alias]]`. May be intra-document or cross-document. |

---

## Vault & Workspace Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **VaultFolder** | BC4 Vault & Workspace | The aggregate representing a single detected vault. Identity: `VaultRoot`. Owns the document collection (`Map<DocId, OFMDoc>`), the `RefGraph`, the merged `FlavorConfig`, and the `FolderLookup` index. |
| **Workspace** | BC4 Vault & Workspace | The top-level aggregate — one per server process. Owns all `VaultFolder` instances. Handles the `SingleFileMode` ↔ multi-file lifecycle. |
| **VaultIndex** | BC4 Vault & Workspace | The name-lookup index internal to a `VaultFolder`. Maps file stems, document titles, and frontmatter aliases to `DocId` arrays. Consumed only through the `Oracle` interface by BC3. |
| **VaultDetector** | BC4 Vault & Workspace | The domain service that decides whether a given directory path constitutes a vault. Detection criteria: presence of `.obsidian/` subdirectory OR presence of `.flavor-grenade.toml`. |
| **FileWatcher** | BC4 Vault & Workspace | The domain service wrapping OS-level filesystem events (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows via Bun's `fs.watch`). Monitors `**/*.md` within vault roots. |
| **GitIgnore** | BC4 Vault & Workspace | A value object representing parsed `.gitignore` rules applied to file scanning. Documents excluded by `.gitignore` are not indexed. |
| **FolderLookup** | BC4 Vault & Workspace | A secondary index inside `VaultFolder` that maps stem → `DocId[]`, title → `DocId[]`, alias → `DocId[]`. Used by the Oracle adapter to answer scope queries. |
| **SingleFileMode** | BC4 Vault & Workspace | The operating mode when neither `.obsidian/` nor `.flavor-grenade.toml` is found. A single document is tracked without vault context. Intra-document refs resolve; cross-document refs are all unresolved. Evicted when a vault enclosing the file is subsequently detected. |

---

## LSP Protocol Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **LspServer** | BC5 LSP Protocol | The application service that is the entry point for all JSON-RPC traffic. Acts as the facade: dispatches requests to BC4/BC3 application services and formats responses. Not a domain object — it is an application service. |
| **LspRequest** | BC5 LSP Protocol | A parsed, typed JSON-RPC request with an `id`, `method`, and typed `params`. |
| **LspResponse** | BC5 LSP Protocol | A typed JSON-RPC response carrying either a `result` or an `error`. |
| **LspNotification** | BC5 LSP Protocol | A typed JSON-RPC notification (no `id`; no response expected). Includes both client→server notifications (`didOpen`, `didChange`) and server→client push notifications (`flavorGrenade/status`). |
| **Capability** | BC5 LSP Protocol | A server capability advertised in the `initialize` response. Examples: `completionProvider`, `definitionProvider`, `diagnosticProvider`. |
| **TextDocumentItem** | BC5 LSP Protocol | The LSP 3.17 `TextDocumentItem` struct: `{ uri, languageId, version, text }`. Received in `textDocument/didOpen` and converted to `OFMDoc` by `LspServer`. |
| **Position** | BC5 LSP Protocol | An LSP 3.17 zero-based `{ line, character }` position within a text document. |
| **Range** | BC5 LSP Protocol | An LSP 3.17 `{ start: Position; end: Position }` range. Used in completion items, definition responses, and diagnostics. |

---

## Config Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **FlavorConfig** | Config | The fully merged configuration for one `VaultFolder`. The result of applying the `ConfigCascade` resolution order. Immutable value; replaced when any source file changes. |
| **ConfigCascade** | Config | The ordered search path for configuration: (1) project `.flavor-grenade.toml` at vault root, (2) user `~/.config/flavor-grenade/config.toml`, (3) built-in defaults. Lower entries are overridden by higher entries. |

---

## Editor Client Terms

| Term | Bounded Context | Definition |
|------|----------------|------------|
| **ExtensionClient** | BC6 Editor Client | The VS Code extension that wraps the LSP server. Responsible for binary resolution, LanguageClient lifecycle, status bar, and Command Palette integration. Thin client (~200 lines); all language intelligence lives in the server. |
| **BinaryResolver** | BC6 Editor Client | The 2-tier resolution strategy for locating the server binary: (1) user setting `flavorGrenade.server.path`, (2) bundled binary at `server/flavor-grenade-lsp[.exe]` relative to extension root. No PATH fallback, no download. |
| **StatusBarWidget** | BC6 Editor Client | A VS Code `StatusBarItem` that reflects the server's indexing state by listening to `flavorGrenade/status` notifications. Displays states: initializing, indexing (with doc count), ready (with doc count), error (with message). |
| **PlatformVSIX** | BC6 Editor Client | A platform-specific `.vsix` package containing the extension client JS bundle and one Bun-compiled server binary for a single target platform. 7 targets: linux-x64, linux-arm64, alpine-x64, darwin-x64, darwin-arm64, win32-x64, win32-arm64. |
| **OFMarkdownLanguageMode** | BC6 Editor Client | The VS Code language id `ofmarkdown`, displayed as `OFMarkdown`, assigned to open documents that Flavor Grenade recognizes as vault/index OFM documents. It is a client-side editor identity, not a new server parser mode. |
| **LanguageModeController** | BC6 Editor Client | The extension component that observes open/visible documents, evaluates vault/index membership signals, and calls VS Code's language assignment API with loop guards. |
| **DocumentMembership** | BC6 Editor Client / BC5 LSP Protocol | The server-authoritative answer to whether a document URI belongs to a multi-file vault or server index and should be treated as OFMarkdown by the VS Code extension. |
| **ExtensionActivation** | BC6 Editor Client | The `activate()` lifecycle entry point. Triggered by `onLanguage:markdown` and `onLanguage:ofmarkdown`. Resolves binary, creates LanguageClient, starts server, wires status bar, commands, and language mode detection. |
| **ExtensionDeactivation** | BC6 Editor Client | The `deactivate()` lifecycle exit point. Client disposal (and server shutdown) is handled by `context.subscriptions`. |

---

## OFM-Specific Extension Terms

These terms distinguish OFM (Obsidian Flavored Markdown) from standard CommonMark and from marksman's domain model.

| Term | Definition |
|------|-----------|
| **OFM** | Obsidian Flavored Markdown — the dialect of Markdown processed by this server. Extends CommonMark with wikilinks, embeds, block anchors, callouts, frontmatter, math, comments, and tags. |
| **Wikilink** | The `[[target]]` or `[[target\|display]]` syntax for internal links. Core to the OFM model. All wikilinks become `WikiRef` domain objects. |
| **EmbedLink** | The `![[target]]` syntax for embedding content (documents, headings, blocks, images). Becomes an `EmbedRef` domain object. First-class in flavor-grenade; treated as opaque in marksman. |
| **Alias** | An alternative name for a document declared in frontmatter as `aliases: [...]`. Registered as an additional `Def` in the `RefGraph`. Completion candidates include aliases. |
| **BlockAnchor** | The `^anchor-id` syntax placed at the end of a paragraph or list item. Makes the block addressable via `[[doc#^anchor-id]]` syntax. |
| **Callout** | An Obsidian callout block: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, etc. Parsed as `CalloutBlock` nodes. Code actions can insert standard callout templates. |
| **Frontmatter** | YAML block at document start delimited by `---`. Contains `title`, `aliases`, `tags`, and arbitrary user metadata. Parsed before the markdown body; errors are recovered gracefully. |

---

## Language Precision Notes

> [!NOTE]
> The word **"document"** means an `OFMDoc` aggregate instance — a parsed, in-memory representation. The word **"file"** means the on-disk artifact. These are different: a file may not be open in the editor (document version = null), or the document may have editor changes not yet saved to the file.

> [!NOTE]
> The word **"vault"** (lowercase) refers to the concept. The word **"VaultFolder"** (PascalCase) refers to the specific aggregate type in BC4. The word **"VaultRoot"** refers to the BC1 value type holding the root path. These distinctions matter in code and in reviews.

> [!TIP]
> When writing code, always use the exact term from this glossary in variable names, function names, and comments. Do not use synonyms like "workspace folder" for `VaultFolder`, "document uri" for `DocId`, or "link" for `WikiRef`. Consistent naming is what makes the ubiquitous language work.
