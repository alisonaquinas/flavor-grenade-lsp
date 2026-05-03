---
title: Workspace Model — VaultFolder and Workspace Composition
tags: [concepts, workspace-model, vaultfolder, workspace, single-file-mode, file-watching]
aliases: [vaultfolder, workspace, folder-lookup, multi-file-mode, single-file-mode]
---

# Workspace Model — VaultFolder and Workspace Composition

The workspace model defines how individual `OFMDoc` values are organized into navigable vault structures. There are three levels of organization: `OFMDoc` (a single document), `VaultFolder` (a set of documents sharing a vault root), and `Workspace` (the union of all `VaultFolder`s known to the server). Feature services never address documents directly; they address documents through the `VaultFolder` and `Workspace` abstractions.

---

## Three-Level Hierarchy

```text
Workspace
  │
  ├── VaultFolder (vault root A: /home/user/vault-a)
  │     ├── OFMDoc (notes/daily.md)
  │     ├── OFMDoc (notes/meeting.md)
  │     ├── OFMDoc (projects/lsp.md)
  │     └── RefGraph (owned by this folder)
  │
  ├── VaultFolder (vault root B: /home/user/vault-b)
  │     ├── OFMDoc (index.md)
  │     └── RefGraph (owned by this folder)
  │
  └── VaultFolder (single-file: /home/user/standalone.md)
        ├── OFMDoc (standalone.md)
        └── RefGraph (trivial — no cross-refs possible)
```

Each `VaultFolder` is isolated: cross-folder link resolution is **never performed**. A wiki-link in vault A can only resolve to documents within vault A. This matches Obsidian's behavior — each Obsidian vault is a closed world.

---

## `VaultFolder`

`VaultFolder` is the central aggregator. It owns:

- The set of `OFMDoc` values currently known for its vault root
- One `RefGraph` (the connection graph for all documents in the folder)
- One `FolderLookup` (the fast slug-based document search index)

### `VaultFolder.withDoc(newDoc)`

The primary mutation operation on a `VaultFolder`. Returns a **new** `VaultFolder` (immutable update) with:

1. The new `OFMDoc` replacing the old one for the given `DocId`
2. A fresh `SymbolDiff` computed by comparing the old and new `OFMIndex`
3. An updated `RefGraph` (via `RefGraph.update(oracle, symDiff)`)
4. An updated `FolderLookup` if the document's slug changed

```typescript
VaultFolder.withDoc(newDoc: OFMDoc): {
  folder:    VaultFolder
  symDiff:   SymbolDiff
  lastTouched: Set<ScopedSym>
}
```

The returned `symDiff` is also passed to `DiagnosticService` to determine which documents need fresh diagnostic evaluation. `lastTouched` (from `RefGraph.update`) is the fine-grained set of symbols whose resolution state changed.

### Multi-File Mode vs Single-File Mode

`VaultFolder` exists in one of two modes:

| Mode | Trigger | RefGraph | FolderLookup | Cross-doc refs |
|------|---------|----------|--------------|----------------|
| **SingleFile** | No vault root found for the document | Contains only one `OFMDoc` | Contains only one entry | Always unresolved (no other docs) |
| **MultiFile** | Vault root found (`.obsidian/` or `.flavor-grenade.toml`) | Contains all vault documents | Full suffix tree | Resolved normally |

A `VaultFolder` does not transition between modes — a new one is created when the mode changes (e.g., a vault root is discovered for a previously single-file document). The old `VaultFolder` is evicted from `Workspace` and replaced.

### Single-File Eviction

When `Workspace.addFolder(multiFileFolder)` is called and `multiFileFolder.root` encloses the root of one or more existing `SingleFile` folders, those single-file folders are **evicted**:

```text
Before:
  Workspace
    ├── VaultFolder[single-file: /vault/notes/daily.md]
    └── VaultFolder[single-file: /vault/notes/meeting.md]

User opens /vault — vault root /vault detected:

After:
  Workspace
    └── VaultFolder[multi-file: /vault]
          ├── OFMDoc(notes/daily.md)   ← absorbed from single-file folder
          └── OFMDoc(notes/meeting.md) ← absorbed from single-file folder
```

The `OFMDoc` values from the evicted single-file folders are **absorbed** into the new multi-file folder if the documents are already parsed (version ≥ 0) — their text does not need to be re-read from disk. Disk-version documents (version `null`) are re-indexed by `FileWatcher` when the multi-file folder initializes.

---

## `FolderLookup`

`FolderLookup` is a suffix tree over vault-relative path components, enabling fast approximate wiki-link resolution. It is the data structure that `Oracle.resolveToScope` queries when processing `Approx`-mode wiki-links.

### Construction

When a `VaultFolder` is created or a document is added/removed, `FolderLookup` is rebuilt incrementally. Each document contributes:

- Its full `VaultPath` string (e.g., `notes/daily/2026-04-16.md`)
- Its stem slug (e.g., `2026-04-16`)
- Its directory components (`notes`, `daily`) — for path-component matching

### Lookup Algorithm

```typescript
lookup(partial: string, mode: ResolutionMode): DocId[]

1. Compute Slug.ofString(partial)
2. If mode = ExactAbs:  find exact VaultPath match
3. If mode = ExactRel:  resolve relative to current doc; find exact match
4. If mode = Approx:
   a. Find all DocIds whose stem slug = query slug  (exact slug match)
   b. If none: find all DocIds whose path contains query slug as a suffix component
   c. Sort by path length (shorter = more specific)
   d. Return all candidates
```

For the common case (`Approx` with a unique slug), step 4a returns one result in O(1) time via the slug hash table. The suffix tree is only traversed for ambiguous or partial-match queries.

### Alias Matching

`FolderLookup` also indexes `AliasDef` slugs. When `[[meeting notes]]` is looked up, the alias slug `meeting notes` matches the `AliasDef` of the document with `aliases: [meeting notes]`, which in turn is associated with that document's `DocId`.

---

## `Workspace`

`Workspace` is the top-level container. It holds the set of all `VaultFolder`s and provides the entry points used by `LspServer`:

```typescript
class Workspace {
  // Add or replace a VaultFolder (triggers eviction if needed)
  addFolder(folder: VaultFolder): Workspace

  // Remove a VaultFolder by root
  removeFolder(root: VaultRoot): Workspace

  // Lookup: which VaultFolder contains this DocId?
  folderFor(docId: DocId): VaultFolder | null

  // Apply a document change to the appropriate VaultFolder
  withDoc(newDoc: OFMDoc): { workspace: Workspace; lastTouched: Set<ScopedSym> }

  // All documents across all folders (for workspace/symbol)
  allDocs(): OFMDoc[]

  // All tags across all folders (for TagCompletionProvider)
  allTags(): string[]
}
```

`Workspace` is itself immutable — every operation returns a new `Workspace` value. The `LspModule` holds the current `Workspace` reference and replaces it on each update.

### Document Membership for Editor Clients

Editor clients sometimes need a simple answer to "does this URI belong to Flavor Grenade's OFM world?" without exposing `VaultFolder`, `DocId`, or `RefGraph` internals. The VS Code extension uses this to decide whether an open Markdown document should be assigned the `ofmarkdown` language id.

Membership is derived from `Workspace` state:

| Workspace state for URI | Membership answer |
|---|---|
| URI belongs to a multi-file `VaultFolder` detected by `.obsidian/` | OFMarkdown |
| URI belongs to a multi-file `VaultFolder` detected by `.flavor-grenade.toml` | OFMarkdown |
| URI is present in a `VaultFolder.docs` map after indexing | OFMarkdown |
| URI is only in `SingleFileMode` | Not OFMarkdown for VS Code language-mode assignment |
| URI is unknown or outside all vault roots | Not OFMarkdown |

This membership view is intentionally narrower than parsing capability. The server can still parse a standalone OFM file in single-file mode, but the VS Code language mode is reserved for vault/index documents per [[ADR016-ofmarkdown-language-mode]].

### Config Merging

When a `VaultFolder` is added to `Workspace`, `ConfigModule` merges the workspace-level config with the folder's `FlavorConfig` (if a `.flavor-grenade.toml` exists in the vault root). The merged config is attached to the `VaultFolder` and used by all feature services when serving requests for documents in that folder.

---

## File Filtering

`VaultFolder` does not index all `.md` files under the vault root. Several categories are excluded:

| Exclusion | Rule |
|-----------|------|
| `.obsidian/` directory | All files under `<root>/.obsidian/` are skipped entirely |
| `.git/` directory | All files under `<root>/.git/` are skipped |
| `.gitignore` patterns | Files matching `.gitignore` rules are excluded (uses `ignore` npm package) |
| `.ignore` patterns | Same as `.gitignore` but in a `.ignore` file |
| Non-`.md` files | Only `.md` files contribute `OFMDoc` values; other file extensions are tracked by `VaultIndex` for embed resolution (existence check only) |

> [!note] `.obsidian/` exclusion detail
> The `.obsidian/` directory contains Obsidian's internal configuration files (JSON format). These are not Markdown files and should never appear as `[[link]]` targets. Excluding them prevents spurious completion candidates and broken-link false positives.

---

## `FileWatcher`

`FileWatcher` monitors the vault root directory for filesystem changes using the OS watch API (via Node.js/Bun `fs.watch`). It translates OS events to domain events:

| OS event | Domain event |
|----------|-------------|
| `rename` (new file) | `DocumentAdded(docId, path)` |
| `rename` (deleted file) | `DocumentClosed(docId)` |
| `rename` (file renamed) | `DocumentClosed(oldDocId)` + `DocumentAdded(newDocId, newPath)` |
| `change` (file modified) | `DiskDocumentChanged(docId, path)` — only for version-null docs |

For editor-open documents (version ≥ 0), `FileWatcher` ignores `change` events — the editor's `textDocument/didChange` notifications are authoritative. Only disk-version documents are re-read on `change` events.

`DocumentClosed` triggers a full `RefGraph.update` with the closed document's symbols as removals, since all its `Def`s must be purged and its `Ref`s can no longer be resolved.

---

## Cross-References

- [[concepts/document-model]] — OFMDoc structure and lifecycle
- [[concepts/connection-graph]] — RefGraph owned by VaultFolder
- [[concepts/path-model]] — VaultRoot, DocId, Slug types
- [[concepts/symbol-model]] — ScopedSym values flowing through withDoc
- [[architecture/data-flow]] — VaultFolder.withDoc in the didChange pipeline
- [[architecture/layers]] — VaultModule in the layer stack
- [[features/ofmarkdown-language-mode]] — VS Code OFMarkdown language mode
