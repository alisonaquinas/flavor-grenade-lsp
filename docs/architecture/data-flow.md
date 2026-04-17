---
title: Architecture Data Flow
tags: [architecture, data-flow, lsp, sequence-diagrams]
aliases: [data-flow, lsp-flows, request-lifecycle]
---

# Architecture Data Flow

This document traces the runtime data flow through `flavor-grenade-lsp` for two of the most important operations: handling a document change notification and serving a completion request. These two flows exercise most of the system and together illustrate how the module layers in [[architecture/layers]] interact at runtime.

---

## Flow 1: Document Change (`textDocument/didChange`)

A document change is the most frequent operation in a live editing session. Because every other feature depends on an up-to-date `OFMDoc`, the change pipeline must be both correct and fast. The key design goals are:

- Re-parse the document fully (no incremental CST patching — CST patching complexity outweighs the savings at typical note sizes).
- Update the `RefGraph` **incrementally** using only the symbol diff, not a full rebuild.
- Republish diagnostics only for documents whose outgoing or incoming references changed.

### Step-by-Step

```
Step  Component               Action
────  ─────────────────────── ───────────────────────────────────────────────
 1    stdin                   JSON-RPC frame arrives: method = "textDocument/didChange"
 2    LspServer               Deserializes frame → DidChangeTextDocumentParams
 3    RequestRouter           Identifies notification handler; dispatches to DocumentModule
 4    TextChangeApplicator    Reads contentChanges[0].text (full text sync; range ignored)
 5    OFMParser               Runs 8-stage OFM parse pipeline on new text → new OFMIndex
 6    DocumentModule          Constructs new OFMDoc(uri, version, text, index); discards old
 7    VaultFolder             Receives new OFMDoc via withDoc(); diffs old vs new OFMIndex
 8    VaultFolder             Produces SymbolDiff { added: ScopedSym[], removed: ScopedSym[] }
 9    RefGraph                update(oracle, symDiff) — surgically re-routes affected edges
10    RefGraph                Sets lastTouched = set of ScopedSyms whose resolution changed
11    DiagnosticService       For each doc in lastTouched, re-evaluates unresolved refs
12    LspServer               Serializes diagnostics → publishes textDocument/publishDiagnostics
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Editor
    participant LspServer
    participant RequestRouter
    participant OFMParser
    participant DocumentModule
    participant VaultFolder
    participant RefGraph
    participant DiagnosticService

    Editor->>LspServer: textDocument/didChange (JSON-RPC)
    LspServer->>RequestRouter: dispatch(notification)
    RequestRouter->>OFMParser: parse(newText)
    OFMParser-->>DocumentModule: OFMIndex
    DocumentModule->>DocumentModule: new OFMDoc(uri, version, text, index)
    DocumentModule->>VaultFolder: withDoc(newDoc)
    VaultFolder->>VaultFolder: diff(oldDoc.index, newDoc.index) → SymbolDiff
    VaultFolder->>RefGraph: update(oracle, symDiff)
    RefGraph->>RefGraph: re-route edges; compute lastTouched
    RefGraph-->>DiagnosticService: lastTouched ScopedSyms
    DiagnosticService->>DiagnosticService: re-evaluate unresolved refs
    DiagnosticService-->>LspServer: Diagnostic[]
    LspServer->>Editor: textDocument/publishDiagnostics (JSON-RPC)
```

### Notes on Full-Text Sync

`flavor-grenade-lsp` uses `TextDocumentSyncKind.Full` (capability value `1`). This means `contentChanges` always contains exactly one entry with the full document text. The server does not track incremental text edits. This simplifies the parse pipeline significantly — there is no "apply delta to rope" step — at the cost of receiving slightly larger payloads. For typical Obsidian notes (< 100 KB), this is a non-issue.

If future performance profiling reveals this to be a bottleneck, a rope-based incremental text store can be added inside `TextChangeApplicator` without changing the interface seen by `OFMParser`.

### Notes on Diagnostic Republishing

Only documents in `lastTouched` receive fresh diagnostic computations. `lastTouched` is the set of `ScopedSym`s whose **resolution state changed** in the last `RefGraph.update` call — i.e., a ref that was previously unresolved is now resolved, or vice versa, or a def that was previously referenced is now unreferenced. This avoids re-running `DiagnosticService` for the entire vault on every keystroke.

> [!note] Tags never produce diagnostics
> `TagRef` symbols always resolve to the Global scope and are never added to the unresolved side-graph. The `DiagnosticService` skips tag symbols when scanning `lastTouched`.

---

## Flow 2: Completion Request (`textDocument/completion`)

Completion is the most latency-sensitive operation. The editor sends the request on each keystroke and cancels previous pending requests. `flavor-grenade-lsp` must respond in under ~100ms for the UI to feel instant.

### Step-by-Step

```
Step  Component                    Action
────  ──────────────────────────── ─────────────────────────────────────────────────
 1    stdin                        JSON-RPC frame: method = "textDocument/completion"
 2    LspServer                    Deserializes → CompletionParams { uri, position, context }
 3    RequestRouter                Dispatches to CompletionService
 4    CompletionService            Retrieves OFMDoc for uri from DocumentModule
 5    CompletionService            Calls provide(doc, position, triggerChar)
 6    CompletionService            Inspects partial token at cursor position in OFMIndex
 7    Trigger dispatch             "[" → WikiLinkCompletionProvider
                                   "#" → TagCompletionProvider
                                   "(" → InlineLinkCompletionProvider
                                   (other) → HeadingCompletionProvider, FrontmatterKeyProvider
 8    WikiLinkCompletionProvider   Queries VaultIndex.lookup(partial, mode=Approx)
 9    VaultIndex / FolderLookup    Returns matching DocId[] using suffix tree
10    WikiLinkCompletionProvider   Converts DocId[] → CompletionItem[] (label=stem, detail=path)
11    CompletionService            Caps list at FlavorConfig.completion.candidates (default 50)
12    CompletionService            Sets isIncomplete = true if cap was reached
13    LspServer                    Serializes CompletionList → JSON-RPC response
14    Editor                       Renders dropdown; sends textDocument/completion/resolve on selection
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Editor
    participant LspServer
    participant RequestRouter
    participant CompletionService
    participant WikiLinkProvider as WikiLinkCompletionProvider
    participant VaultIndex

    Editor->>LspServer: textDocument/completion {uri, position, triggerChar="["}
    LspServer->>RequestRouter: dispatch(request)
    RequestRouter->>CompletionService: provide(doc, position, "[")
    CompletionService->>CompletionService: inspect partial token at cursor
    CompletionService->>WikiLinkProvider: complete(partial, doc)
    WikiLinkProvider->>VaultIndex: lookup(partial, mode=Approx)
    VaultIndex-->>WikiLinkProvider: DocId[] (sorted by recency + relevance)
    WikiLinkProvider-->>CompletionService: CompletionItem[]
    CompletionService->>CompletionService: cap at candidates limit; set isIncomplete
    CompletionService-->>LspServer: CompletionList
    LspServer-->>Editor: JSON-RPC response {items, isIncomplete}
```

### Trigger Character Dispatch

The `CapabilityNegotiator` declares `triggerCharacters: ["[", "#", "("]` in the `completionProvider` capability. The editor sends the trigger character in `CompletionParams.context.triggerCharacter`. `CompletionService` uses this to fast-path to the correct sub-provider without scanning the document text.

| Trigger | Sub-provider | Completes |
|---------|-------------|-----------|
| `[` (second `[`) | `WikiLinkCompletionProvider` | Document slugs, heading anchors, block anchors |
| `#` | `TagCompletionProvider` | Known tags from VaultIndex tag set |
| `(` | `InlineLinkCompletionProvider` | Standard Markdown link URLs (minimal; OFM rarely uses these) |
| *(none / other)* | `FrontmatterKeyProvider`, `HeadingCompletionProvider` | YAML keys, heading text within current doc |

### Embed Completion

When the cursor is inside `![[`, the trigger character is still `[` (second bracket). `CompletionService` inspects the preceding character: if it is `!`, it dispatches to `EmbedCompletionProvider` instead of `WikiLinkCompletionProvider`. Embed completions include image files and audio files in addition to `.md` files — their `CompletionItem.detail` includes the file extension.

### Callout Type Completion

When the cursor is inside `> [!` (beginning of a callout block), a `CalloutTypeCompletionProvider` fires. It returns a fixed list of recognized callout types (`note`, `tip`, `warning`, `danger`, `info`, `success`, `question`, `bug`, `example`, `quote`, `abstract`, `todo`, `failure`) plus any custom types registered in `FlavorConfig.callouts.customTypes`.

---

## Flow Interactions

The two flows interact through shared state in `VaultFolder` and `RefGraph`:

```
textDocument/didChange ──→ VaultFolder.withDoc()
                                  │
                                  ▼
                           RefGraph.update()
                                  │
                          lastTouched computed
                                  │
                        DiagnosticService.run()
                                  │
                       publishDiagnostics sent

textDocument/completion ──→ VaultIndex.lookup()
                                  │
                    (reads from VaultFolder's FolderLookup)
                                  │
                           CompletionItem[] returned
```

The completion flow reads from `VaultIndex` but does not write to it. The change flow writes to `VaultFolder` (and through it to `RefGraph` and `VaultIndex`). There is no locking requirement in the current single-threaded Bun event loop model — the reads in the completion flow always see a consistent snapshot because JavaScript's event loop processes one microtask at a time.

> [!tip] Bun single-thread model
> Because `flavor-grenade-lsp` runs in Bun's single-threaded event loop, concurrent access to `RefGraph` or `VaultIndex` is not possible within a single server process. If a `didChange` notification and a `completion` request arrive in the same event tick, the `didChange` handler runs to completion (producing updated state) before the `completion` handler starts — or vice versa, depending on arrival order. No explicit synchronization primitives are needed.

---

## Cross-References

- [[architecture/overview]] — Design principles that motivated these flow designs
- [[architecture/layers]] — Module ownership of each step in these flows
- [[concepts/connection-graph]] — RefGraph.update and Oracle internals
- [[concepts/document-model]] — OFMDoc, OFMIndex, parse pipeline
- [[concepts/workspace-model]] — VaultFolder.withDoc and SymbolDiff
- [[design/api-layer]] — Full LSP method catalog
