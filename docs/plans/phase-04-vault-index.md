---
title: "Phase 4: Vault Index"
phase: 4
status: planned
tags: [vault, index, file-watcher, detection, doc-id, folder-lookup]
updated: 2026-04-16
---

# Phase 4: Vault Index

| Field      | Value |
|------------|-------|
| Phase      | 4 |
| Title      | Vault Index |
| Status     | ⏳ planned |
| Gate       | `bun test src/vault/**` all pass; `vault-detection.feature` all scenarios pass |
| Depends on | Phase 3 (OFM Parser) |

---

## Objective

Build the vault-awareness layer: detect the vault root, scan and index all documents, watch for filesystem changes, and provide the cross-file lookup primitives that wiki-link resolution (Phase 5) depends on. After this phase, the server knows all documents in the vault and can answer "which documents have stem X?"

---

## Task List

- [ ] **1. Implement `VaultDetector`**

  Create `src/vault/vault-detector.ts`. Algorithm:
  1. Start at `rootUri` provided in the `initialize` request
  2. Check if `.obsidian/` directory exists → return `{ mode: 'obsidian', vaultRoot }`
  3. Check if `.flavor-grenade.toml` exists → return `{ mode: 'flavor-grenade', vaultRoot }`
  4. If both exist, obsidian takes precedence (log this decision)
  5. Walk up parent directories until filesystem root
  6. If no marker found → return `{ mode: 'single-file', vaultRoot: null }`

  ```typescript
  export type VaultMode = 'obsidian' | 'flavor-grenade' | 'single-file';

  export interface VaultDetectionResult {
    mode: VaultMode;
    vaultRoot: string | null;
    fullFeatures: boolean;
  }

  export class VaultDetector {
    detect(startPath: string): Promise<VaultDetectionResult>;
  }
  ```

  Result is cached after the first call. Subsequent calls return the cached result.

- [ ] **2. Define `DocId` value type**

  Create `src/vault/doc-id.ts`. `DocId` is a branded string (vault-root-relative path without extension):

  ```typescript
  export type DocId = string & { readonly __brand: 'DocId' };

  export function toDocId(vaultRoot: string, absolutePath: string): DocId;
  export function fromDocId(vaultRoot: string, docId: DocId): string;  // absolute path
  ```

  Example: vault root `/home/user/vault`, file `/home/user/vault/notes/alpha.md` → `DocId("notes/alpha")`.

- [ ] **3. Implement `VaultIndex`**

  Create `src/vault/vault-index.ts`. An in-memory map from `DocId` to `OFMDoc`:

  ```typescript
  export class VaultIndex {
    /** Insert or replace a document */
    set(docId: DocId, doc: OFMDoc): void;

    /** Remove a document (on file deletion) */
    delete(docId: DocId): void;

    /** Look up by DocId */
    get(docId: DocId): OFMDoc | undefined;

    /** All DocIds in index */
    keys(): IterableIterator<DocId>;

    /** All OFMDocs in index */
    values(): IterableIterator<OFMDoc>;

    /** Number of indexed documents */
    get size(): number;
  }
  ```

- [ ] **4. Implement `FolderLookup` — suffix tree for approximate name matching**

  Create `src/vault/folder-lookup.ts`. Supports the Obsidian-style wiki-link resolution where `[[alpha]]` resolves to `notes/alpha.md` even though the link omits the path prefix.

  Algorithm: build a trie over reversed path segments. For query `"alpha"`, find all `DocId`s whose stem ends in `"alpha"` (exact) or is a suffix match.

  ```typescript
  export interface LookupResult {
    docId: DocId;
    doc: OFMDoc;
  }

  export class FolderLookup {
    /** Rebuild the lookup from the current VaultIndex */
    rebuild(index: VaultIndex): void;

    /** Find all documents matching the given stem (case-insensitive) */
    findByStem(stem: string): LookupResult[];

    /** Find exact match by stem (returns one or undefined) */
    findExact(stem: string): LookupResult | undefined;

    /** Find all documents matching a path-qualified stem like "folder/note" */
    findByPath(path: string): LookupResult | undefined;
  }
  ```

- [ ] **5. Implement `VaultScanner` — initial index build**

  Create `src/vault/vault-scanner.ts`. On startup (after `initialized` notification):
  1. Walk the vault root directory recursively using `Bun.Glob` or `fs.readdir` with `recursive: true`
  2. Filter files by configured extensions (default: `.md`)
  3. Exclude paths matching `.gitignore` patterns (use `ignore` npm package)
  4. Exclude the `.obsidian/` directory
  5. For each file: read content, call `OFMParser.parse()`, add to `VaultIndex`
  6. After scan complete, rebuild `FolderLookup`
  7. Send `flavorGrenade/status` notification: `{ status: 'ready' }`

  ```bash
  bun add ignore
  ```

- [ ] **6. Implement `FileWatcher` using `Bun.watch()`**

  Create `src/vault/file-watcher.ts`. Watch the vault root for changes:

  ```typescript
  export class FileWatcher {
    start(vaultRoot: string, handler: FileChangeHandler): void;
    stop(): void;
  }

  export interface FileChangeHandler {
    onCreate(path: string): Promise<void>;
    onModify(path: string): Promise<void>;
    onDelete(path: string): Promise<void>;
    onRename(oldPath: string, newPath: string): Promise<void>;
  }
  ```

  On each event:
  - `onCreate` / `onModify`: re-parse the file, update `VaultIndex`, rebuild `FolderLookup`, re-run diagnostics on all files that link to this one
  - `onDelete`: remove from `VaultIndex`, rebuild `FolderLookup`, emit FG001 for all files that linked to this one
  - `onRename`: treat as delete old + create new

- [ ] **7. Implement `.gitignore` / `.ignore` file filtering**

  Create `src/vault/ignore-filter.ts`. Read `.gitignore` from vault root. Also support `.ignore` files. Use the `ignore` package to test each candidate path.

  ```typescript
  export class IgnoreFilter {
    load(vaultRoot: string): Promise<void>;
    isIgnored(relativePath: string): boolean;
  }
  ```

- [ ] **8. Implement single-file mode fallback**

  When `VaultDetector` returns `mode: 'single-file'`:
  - `VaultIndex` contains only the currently open document(s)
  - `FolderLookup` is empty
  - `FileWatcher` is not started
  - Cross-file diagnostic codes (FG001, FG002, FG004, FG005) are suppressed globally

- [ ] **9. Implement `flavorGrenade/awaitIndexReady` custom request**

  Used by BDD tests to synchronize: the test client sends this request after `initialized` and waits for the response, which the server sends only after the initial vault scan is complete. This prevents race conditions in tests.

- [ ] **10. Register all vault services in `VaultModule`**

  Create `src/vault/vault.module.ts` with providers: `VaultDetector`, `VaultIndex`, `FolderLookup`, `VaultScanner`, `FileWatcher`, `IgnoreFilter`. Export all for use by feature modules.

- [ ] **11. Write unit tests for `VaultDetector`**

  Use fixture directories under `src/test/fixtures/vault-detection/`:
  ```
  fixture-obsidian/       (has .obsidian/)
  fixture-toml/           (has .flavor-grenade.toml)
  fixture-both/           (has both — obsidian wins)
  fixture-neither/        (no marker)
  fixture-nested/outer/   (inner .obsidian/ at outer/inner/)
  ```

- [ ] **12. Write unit tests for `FolderLookup`**

  Test cases:
  - Stem matches root-level file
  - Stem matches nested file
  - Ambiguous stem (two files with same stem in different folders) returns both
  - Path-qualified stem `"folder/note"` resolves uniquely

---

## Gate Verification

```bash
# Unit tests
bun test src/vault/

# BDD vault detection scenarios (all, not just @smoke)
bun run bdd -- features/vault-detection.feature
bun run bdd -- features/workspace.feature
```

---

## References

- `[[adr/ADR003-vault-detection]]`
- `[[ddd/vault/domain-model]]`
- `[[concepts/workspace-model]]`
- `[[plans/phase-05-wiki-links]]`
