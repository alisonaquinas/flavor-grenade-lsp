# AGENTS.md — src/vault/

## Purpose

Owns all vault-awareness: detecting where the vault is, scanning it, watching
for changes, and maintaining the `VaultIndex` that all feature modules read.

## Layout

```
vault/
├── vault-index.ts               # Map<DocId, OFMDoc> — single document source of truth
├── vault-detector.ts            # walk-up tree detection of vault root and mode
├── vault-scanner.ts             # startup scan — populates VaultIndex from disk
├── file-watcher.ts              # incremental updates from filesystem events
├── doc-id.ts                    # DocId branded type and path utilities
├── folder-lookup.ts             # stem → DocId[] index for Oracle
├── ignore-filter.ts             # which files/directories to skip during scan
├── single-file-mode.ts          # single-file mode handling
├── vault.module.ts              # NestJS module + debug flavorGrenade/* endpoints
├── handlers/
│   └── await-index-ready.handler.ts
└── __tests__/
```

## Invariants

- `VaultIndex` is the **only** place `OFMDoc` objects are stored at runtime.
  No feature module should maintain its own document cache.
- `DocId` values are always vault-relative paths — never absolute paths. All
  consumers must use `doc-id.ts` utilities when converting between URIs and
  DocIds.
- `VaultDetector` caches its result after the first call. It should not be
  called with different `startPath` arguments expecting fresh results.
- `FolderLookup` must be rebuilt or invalidated whenever `VaultIndex`
  changes, since stem lookups depend on the current index state.

## Workflows

- **After adding a new document field**: update `OFMDoc` in `parser/types.ts`,
  update `VaultScanner` and `DidOpenHandler` to populate the new field,
  update the `flavorGrenade/queryDoc` debug endpoint if the field should be
  visible to BDD tests.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [CONCEPTS.md](../../CONCEPTS.md) — DocId, VaultIndex, VaultMode
