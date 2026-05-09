---
title: API Layer — LSP Method Catalog and Capability Matrix
tags: [design, api-layer, lsp, capabilities, methods]
aliases: [lsp-api, capability-matrix, lsp-methods, server-capabilities]
---

# API Layer — LSP Method Catalog and Capability Matrix

This document catalogs every LSP method handled by `flavor-grenade-lsp`, the capability declared for it in the `initialize` response, and OFM-specific behavioral notes. The capability matrix is the authoritative reference for what the server advertises to editor clients.

---

## Initialization

### `initialize`

The handshake method. The server declares all capabilities in the `ServerCapabilities` object. The `CapabilityNegotiator` service constructs this object from the capabilities registered by each feature service.

Key capability declarations:

```json
{
  "textDocumentSync": 1,
  "completionProvider": {
    "triggerCharacters": ["[", "!", "#", "^", ">", "("],
    "commitCharacters": ["]"],
    "resolveProvider": false
  },
  "definitionProvider": true,
  "referencesProvider": true,
  "hoverProvider": true,
  "renameProvider": { "prepareProvider": true },
  "documentHighlightProvider": true,
  "documentSymbolProvider": true,
  "workspaceSymbolProvider": true,
  "codeLensProvider": { "resolveProvider": false },
  "codeActionProvider": true,
  "documentLinkProvider": { "resolveProvider": false },
  "semanticTokensProvider": {
    "legend": { "tokenTypes": [...], "tokenModifiers": [] },
    "full": true,
    "range": false
  },
  "foldingRangeProvider": true,
  "selectionRangeProvider": true,
  "workspace": {
    "fileOperations": {
      "willRename": { "filters": [{ "pattern": { "glob": "**/*" } }] },
      "didRename": { "filters": [{ "pattern": { "glob": "**/*" } }] }
    }
  }
}
```

`textDocumentSync = 1` declares Full sync. The server handles `textDocument/didOpen`, `textDocument/didChange`, and `textDocument/didClose`; it does not currently advertise a save handler.

---

## Capability Matrix

| Method | Capability Key | Trigger Characters | OFM-Specific Behaviour |
|--------|---------------|--------------------|------------------------|
| `initialize` | — | — | Declares all capabilities; sets trigger chars `[`, `#`, `(` |
| `initialized` | — | — | Server begins vault detection; initializes `VaultDetector` |
| `shutdown` | — | — | Flushes pending diagnostics; disposes `FileWatcher` |
| `exit` | — | — | Process exits with code 0 (after shutdown) or 1 (without) |
| `textDocument/didOpen` | `textDocumentSync.openClose` | — | Creates `OFMDoc` with version from params; triggers initial diagnostics |
| `textDocument/didChange` | `textDocumentSync.change` | — | Full text sync; replaces `OFMDoc`; triggers RefGraph update |
| `textDocument/didClose` | `textDocumentSync` | — | Removes the document from `DocumentStore` and clears parse-cache state |
| `textDocument/completion` | `completionProvider` | `[`, `!`, `#`, `^`, `>`, `(` | OFM: wiki-links, tags, callout types, embeds, heading anchors, block refs, Markdown link contexts |
| `textDocument/completion/resolve` | `completionProvider.resolveProvider = false` | — | Not implemented |
| `textDocument/definition` | `definitionProvider` | — | OFM: wiki-links (`DocDef`, `HeaderDef`, `BlockAnchorDef`), embeds, alias targets |
| `textDocument/references` | `referencesProvider` | — | OFM: headings → all `CrossSection` refs; docs → all `CrossDoc` refs; block anchors → all `CrossBlock` refs; tags → all `TagRef`s |
| `textDocument/hover` | `hoverProvider` | — | OFM: wiki-link preview (first 5 lines of target), tag info (usage count + subtags), frontmatter key description |
| `textDocument/rename` | `renameProvider` | — | OFM: heading rename (updates all `CrossSection` refs); file rename via `workspace/applyEdit` (updates all `CrossDoc` refs + wiki-link text) |
| `textDocument/prepareRename` | `renameProvider.prepareProvider` | — | Returns `null` if cursor is not on a renameable symbol (link target, heading, tag — not label text) |
| `textDocument/publishDiagnostics` | — (notification, server → client) | — | OFM: `BrokenLink`, `AmbiguousLink`, `MalformedWikiLink`, `BrokenEmbed`, `BrokenBlockRef`, `NonBreakableWhitespace`, `MalformedFrontmatter` |
| `textDocument/documentSymbol` | `documentSymbolProvider` | — | Returns headings as a nested `DocumentSymbol` tree (h1 → h2 → h3 etc.) |
| `workspace/symbol` | `workspaceSymbolProvider` | — | All headings across vault; subsequence matching on query string |
| `textDocument/codeLens` | `codeLensProvider` | — | "N references" lens on each heading; "N references" on each block anchor |
| `textDocument/codeAction` | `codeActionProvider` | — | `InsertTOC` (heading list), `CreateMissingFile` (broken wiki-link target), `FixNbsp` (replace U+00A0), `TagToYaml` (move inline `#tag` to frontmatter) |
| `textDocument/documentLink` | `documentLinkProvider` | — | OFM and Markdown local links become clickable when unambiguous; ambiguous links rely on diagnostics |
| `textDocument/semanticTokens/full` | `semanticTokensProvider.full` | — | OFM tokens: `wikiLink`, `wikiLinkTarget`, `wikiLinkLabel`, `embed`, `tag`, `blockAnchor`, `calloutType`, `calloutTitle`, `mathInline`, `mathBlock`, `ofmComment` |
| `textDocument/foldingRange` | `foldingRangeProvider` | — | Frontmatter, headings, callout blocks, display math blocks (`$$`), OFM comment blocks (`%%`), fenced code blocks, and Templater blocks (`<% ... %>`) |
| `textDocument/selectionRange` | `selectionRangeProvider` | — | Expands from OFM token to full construct, paragraph, section, and document; opaque regions are bounded to their own range |
| `workspace/didChangeWatchedFiles` | `workspace.fileOperations` | — | Triggered on `*.md` create/delete; updates `VaultFolder` and `RefGraph` |
| `workspace/willRenameFiles` | `workspace.fileOperations.willRename` | — | Returns WorkspaceEdit for note, folder, and attachment moves before the editor applies the file operation |
| `workspace/didRenameFiles` | `workspace.fileOperations.didRename` | — | Updates `DocId`, refreshes index, and reports diagnostics when a client did not request `willRenameFiles` |
| `workspace/executeCommand` | — | — | Command: `flavorGrenade.rebuildIndex` |
| `flavorGrenade/documentMembership` | custom request | — | VS Code extension asks whether a URI belongs to a vault/index and should be assigned `ofmarkdown` |

---

## Diagnostic Codes

`DiagnosticService` produces diagnostics with OFM-specific codes. These are returned in `textDocument/publishDiagnostics`:

| Code | Severity | Meaning | Suggested Fix |
|------|----------|---------|---------------|
| `FG001` | Error | `[[target]]`, `[[doc#heading]]`, or Markdown local link target cannot resolve | CodeAction: `CreateMissingFile` for broken wiki-links |
| `FG002` | Error | Link or attachment target matches more than one candidate | No auto-fix; diagnostic related information lists candidates where available |
| `FG003` | Error | Wiki-link target is empty or blank | No auto-fix |
| `FG004` | Warning | Embed or Markdown image attachment target cannot resolve | No auto-fix |
| `FG005` | Error | `[[doc#^id]]` resolves to a document but block anchor `^id` is missing | No auto-fix |
| `FG006` | Warning | U+00A0 non-breaking space appears in document body | CodeAction: `FixNbsp` |
| `FG007` | Warning | YAML parse error in frontmatter block | No auto-fix |

---

## Semantic Token Legend

The semantic token legend declared in `initialize` maps token type names to integer indices. OFM-specific token types:

| Index | Token Type | Applied To |
|-------|-----------|------------|
| 0 | `wikiLink` | Full `[[...]]` span |
| 1 | `wikiLinkTarget` | Target portion of wiki-link (before `|` and `#`) |
| 2 | `wikiLinkLabel` | Label portion of wiki-link (after `|`) |
| 3 | `wikiLinkAnchor` | Anchor portion (`#heading` or `#^block`) |
| 4 | `embed` | Full `![[...]]` span |
| 5 | `tag` | Full `#tag` span |
| 6 | `blockAnchor` | `^blockid` token |
| 7 | `calloutType` | Type name within `> [!type]` |
| 8 | `calloutTitle` | Title text within `> [!type] title` |
| 9 | `mathInline` | `$...$` span |
| 10 | `mathBlock` | `$$...$$` span |
| 11 | `ofmComment` | `%%...%%` span |

Editor themes map these token types to colors. The `wikiLinkTarget` type allows editors to highlight unresolved links differently (e.g., dimmed or red) by inspecting the resolution state from `DiagnosticService`.

---

## Custom Notification: `flavorGrenade/status`

`flavor-grenade-lsp` publishes a non-standard notification to inform clients of server status changes:

```typescript
// Notification: server → client
// Method: "flavorGrenade/status"
type FlavorGrenadeStatusParams = {
  state:       'initializing' | 'indexing' | 'ready' | 'error'
  vaultCount:  number          // number of VaultFolders currently tracked
  docCount:    number          // total OFMDoc count across all folders
  message?:    string          // human-readable status detail
}
```

Published at:

- Server startup (`state: 'initializing'`)
- After `VaultDetector` completes vault scan (`state: 'indexing'`)
- After `RefGraph.mk` completes for all folders (`state: 'ready'`)
- On unrecoverable error (`state: 'error'`, with `message`)

Editor extensions (e.g., the `flavor-grenade.nvim` companion plugin) use this notification to display a status indicator in the status bar.

---

## Custom Request: `flavorGrenade/documentMembership`

The VS Code extension uses this request to decide whether an open Markdown document should be assigned the `ofmarkdown` language id. The request is client-specific but server-authoritative: BC6 owns VS Code language mode assignment, while BC4 owns vault/index membership.

```typescript
// Request: client → server
// Method: "flavorGrenade/documentMembership"
type DocumentMembershipParams = {
  uri: string;
}

type DocumentMembershipResult = {
  isOfMarkdown: boolean;
  indexed: boolean;
  vaultRoot?: string;
  reason: 'obsidian-vault' | 'flavor-config-vault' | 'single-file' | 'not-indexed';
}
```

Result semantics:

| Field | Meaning |
|---|---|
| `isOfMarkdown` | True when the document belongs to a multi-file vault or is present in the server index as an OFM document |
| `indexed` | True when the document URI currently maps to an indexed `OFMDoc` |
| `vaultRoot` | Absolute vault root path when the URI belongs to a detected vault |
| `reason` | Stable explanation used by extension tests and debug logs |

The server must return `isOfMarkdown: false` for unsupported URI schemes and non-indexed generic Markdown. It must not emit diagnostics for membership failures; the request is an editor affordance, not a document correctness rule.

---

## VS Code Command Bridge Payloads

VS Code-specific command bridges are owned by the extension, not the server. The
server may return `flavorGrenade.*` command identifiers and JSON payloads in
code lens, code actions, or custom responses when a native VS Code UI surface is
more appropriate than a plain LSP result.

Candidate commands:

| Command | Payload | VS Code action |
|---|---|---|
| `flavorGrenade.showReferences` | source location plus reference locations | `editor.action.showReferences` |
| `flavorGrenade.followLink` | one source location and one or more target locations | VS Code location picker or direct open |
| `flavorGrenade.openEmbedTarget` | target URI and optional range | Open note or asset |
| `flavorGrenade.showBacklinks` | document URI | Backlink picker or panel |
| `flavorGrenade.showOutlinks` | document URI | Outlink picker or panel |
| `flavorGrenade.copyDiagnosticInfo` | extension/server/vault status fields | Clipboard write |

All payloads must be JSON-serializable. The server must not import VS Code API
types.

---

## Code Action Catalog

`CodeActionService` provides four code actions. Each is triggered by a diagnostic or by the editor's code action request on a specific symbol range:

| Action ID | Kind | Trigger | Description |
|-----------|------|---------|-------------|
| `flavorGrenade.insertTOC` | `source` | Cursor in heading area | Inserts or replaces a Markdown table of contents based on document headings |
| `flavorGrenade.createMissingFile` | `quickfix` | Server-issued `BrokenLink` diagnostic whose range still matches a parsed wiki-link | Creates an empty `.md` file at the vault-confined path implied by the broken wiki-link target |
| `flavorGrenade.fixNbsp` | `quickfix` | `FG006` diagnostic | Replaces a non-breaking space with a regular space |
| `flavorGrenade.tagToYaml` | `refactor` | Cursor on inline `#tag` | Moves the tag from inline text to the `tags:` array in frontmatter |

---

## Workspace Commands

`workspace/executeCommand` supports this command:

| Command | Arguments | Description |
|---------|-----------|-------------|
| `flavorGrenade.rebuildIndex` | *(none)* | Forces full `RefGraph.mk` rebuild for all vault folders |

---

## Cross-References

- [[architecture/overview]] — Transport and server entry point
- [[architecture/data-flow]] — Lifecycle of didChange and completion flows
- [[design/behavior-layer]] — BDD scenarios for each LSP method
- [[design/domain-layer]] — Domain events underlying LSP notifications
- [[concepts/connection-graph]] — RefGraph queries behind definition/references
- [[concepts/symbol-model]] — Symbol types returned by definition/references
- [[features/ofmarkdown-language-mode]] — VS Code OFMarkdown language mode behavior
