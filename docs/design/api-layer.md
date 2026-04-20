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
  "textDocumentSync": { "change": 1, "openClose": true, "save": { "includeText": false } },
  "completionProvider": {
    "triggerCharacters": ["[", "#", "("],
    "resolveProvider": true
  },
  "definitionProvider": true,
  "referencesProvider": true,
  "hoverProvider": true,
  "renameProvider": { "prepareProvider": true },
  "documentSymbolProvider": true,
  "workspaceSymbolProvider": true,
  "codeLensProvider": { "resolveProvider": false },
  "codeActionProvider": { "codeActionKinds": ["quickfix", "refactor", "source"] },
  "semanticTokensProvider": {
    "legend": { "tokenTypes": [...], "tokenModifiers": [] },
    "full": true,
    "range": false
  },
  "foldingRangeProvider": true,
  "workspace": {
    "fileOperations": {
      "didRename": { "filters": [{ "pattern": { "glob": "**/*.md" } }] }
    }
  }
}
```

`textDocumentSync.change = 1` declares Full sync. `openClose: true` means the server listens for `textDocument/didOpen` and `textDocument/didClose`. `save.includeText: false` means `textDocument/didSave` carries no content (the server does not act on save).

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
| `textDocument/didClose` | `textDocumentSync.openClose` | — | Sets doc to disk-version (version=null); retained in vault index |
| `textDocument/didSave` | `textDocumentSync.save` | — | No-op (no text included); retained for future save-triggered actions |
| `textDocument/completion` | `completionProvider` | `[`, `#`, `(` | OFM: wiki-links, tags, callout types, embeds, heading anchors, block refs |
| `textDocument/completion/resolve` | `completionProvider.resolveProvider` | — | Populates `documentation` field with hover preview of target doc |
| `textDocument/definition` | `definitionProvider` | — | OFM: wiki-links (`DocDef`, `HeaderDef`, `BlockAnchorDef`), embeds, alias targets |
| `textDocument/references` | `referencesProvider` | — | OFM: headings → all `CrossSection` refs; docs → all `CrossDoc` refs; block anchors → all `CrossBlock` refs; tags → all `TagRef`s |
| `textDocument/hover` | `hoverProvider` | — | OFM: wiki-link preview (first 5 lines of target), tag info (usage count + subtags), frontmatter key description |
| `textDocument/rename` | `renameProvider` | — | OFM: heading rename (updates all `CrossSection` refs); file rename via `workspace/applyEdit` (updates all `CrossDoc` refs + wiki-link text) |
| `textDocument/prepareRename` | `renameProvider.prepareProvider` | — | Returns `null` if cursor is not on a renameable symbol (link target, heading, tag — not label text) |
| `textDocument/publishDiagnostics` | — (notification, server → client) | — | OFM: `BrokenLink`, `BrokenSection`, `BrokenBlockRef`, `BrokenEmbed`, `BrokenIntraLink`, `MalformedBlockAnchor`, `MalformedFrontmatter` |
| `textDocument/documentSymbol` | `documentSymbolProvider` | — | Returns headings as a nested `DocumentSymbol` tree (h1 → h2 → h3 etc.) |
| `workspace/symbol` | `workspaceSymbolProvider` | — | All headings across vault; subsequence matching on query string |
| `textDocument/codeLens` | `codeLensProvider` | — | "N references" lens on each heading; "N references" on each block anchor |
| `textDocument/codeAction` | `codeActionProvider` | — | `InsertTOC` (heading list), `CreateMissingFile` (broken wiki-link target), `TagToYaml` (move inline `#tag` to frontmatter), `NormalizeFrontmatter` |
| `textDocument/semanticTokens/full` | `semanticTokensProvider.full` | — | OFM tokens: `wikiLink`, `wikiLinkTarget`, `wikiLinkLabel`, `embed`, `tag`, `blockAnchor`, `calloutType`, `calloutTitle`, `mathInline`, `mathBlock`, `ofmComment` |
| `textDocument/foldingRange` | `foldingRangeProvider` | — | Callout blocks, display math blocks (`$$`), OFM comment blocks (`%%`), fenced code blocks |
| `workspace/didChangeWatchedFiles` | `workspace.fileOperations` | — | Triggered on `*.md` create/delete; updates `VaultFolder` and `RefGraph` |
| `workspace/didRenameFiles` | `workspace.fileOperations.didRename` | — | Updates `DocId`, rewrites all wiki-links to renamed file via `workspace/applyEdit` |
| `workspace/executeCommand` | `executeCommandProvider` | — | Commands: `flavorGrenade.rebuildIndex`, `flavorGrenade.insertBlockAnchor`, `flavorGrenade.openLinkedNote` |

---

## Diagnostic Codes

`DiagnosticService` produces diagnostics with OFM-specific codes. These are returned in `textDocument/publishDiagnostics`:

| Code | Severity | Meaning | Suggested Fix |
|------|----------|---------|---------------|
| `BrokenLink` | Error | `[[target]]` — no document with matching slug | CodeAction: `CreateMissingFile` |
| `BrokenSection` | Error | `[[doc#heading]]` — doc exists but heading not found | No auto-fix |
| `BrokenBlockRef` | Error | `[[doc#^id]]` — doc exists but block anchor not found | No auto-fix |
| `BrokenEmbed` | Error | `![[file]]` — no file with matching path | CodeAction: `CreateMissingFile` (for .md) |
| `BrokenIntraLink` | Warning | `[[#heading]]` — heading not found in current doc | No auto-fix |
| `MalformedBlockAnchor` | Warning | `^id` — block anchor ID contains invalid characters | No auto-fix |
| `MalformedFrontmatter` | Warning | YAML parse error in frontmatter block | No auto-fix |
| `AmbiguousLink` | Hint | `[[target]]` — matches more than one document | No auto-fix; hover shows all candidates |

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

## Code Action Catalog

`CodeActionService` provides four code actions. Each is triggered by a diagnostic or by the editor's code action request on a specific symbol range:

| Action ID | Kind | Trigger | Description |
|-----------|------|---------|-------------|
| `flavorGrenade.insertTOC` | `source` | Cursor in heading area | Inserts a Markdown table of contents at cursor position based on document headings |
| `flavorGrenade.createMissingFile` | `quickfix` | `BrokenLink` or `BrokenEmbed` diagnostic | Creates an empty `.md` file at the path implied by the broken wiki-link target |
| `flavorGrenade.tagToYaml` | `refactor` | Cursor on inline `#tag` | Moves the tag from inline text to the `tags:` array in frontmatter |
| `flavorGrenade.normalizeFrontmatter` | `source` | Any position in doc | Sorts frontmatter keys alphabetically and normalizes YAML formatting |

---

## Workspace Commands

`workspace/executeCommand` supports these commands (registered via `executeCommandProvider`):

| Command | Arguments | Description |
|---------|-----------|-------------|
| `flavorGrenade.rebuildIndex` | *(none)* | Forces full `RefGraph.mk` rebuild for all vault folders |
| `flavorGrenade.insertBlockAnchor` | `{ uri, line }` | Inserts a generated `^block-id` at the end of the paragraph on `line` |
| `flavorGrenade.openLinkedNote` | `{ uri, position }` | Opens the note targeted by the wiki-link at `position` (editor-side command) |

---

## Cross-References

- [[architecture/overview]] — Transport and server entry point
- [[architecture/data-flow]] — Lifecycle of didChange and completion flows
- [[design/behavior-layer]] — BDD scenarios for each LSP method
- [[design/domain-layer]] — Domain events underlying LSP notifications
- [[concepts/connection-graph]] — RefGraph queries behind definition/references
- [[concepts/symbol-model]] — Symbol types returned by definition/references
