# vault/

Vault detection, document indexing, file watching, and vault scanning.

This module is responsible for building and maintaining the in-memory
`VaultIndex` — the single source of truth for all parsed documents the server
knows about.

## Files

| File                                    | Role                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `vault-detector.ts`                     | Walks the directory tree upward to find `.obsidian/` or `.flavor-grenade.toml`; returns `VaultMode` and `vaultRoot` |
| `vault-index.ts`                        | `Map<DocId, OFMDoc>` — single source of truth for all indexed documents                                             |
| `vault-scanner.ts`                      | Scans the vault directory on startup, parses every `.md` file, and populates `VaultIndex`                           |
| `file-watcher.ts`                       | Watches the vault directory for file-system changes (create, modify, delete) and updates `VaultIndex` incrementally |
| `doc-id.ts`                             | `DocId` branded-string type and conversion utilities                                                                |
| `folder-lookup.ts`                      | Stem-based document lookup — maps file stem to all `DocId`s sharing that stem for wiki-link resolution              |
| `ignore-filter.ts`                      | Filters out files that should not be indexed (e.g. inside `.obsidian/`, `node_modules/`)                            |
| `single-file-mode.ts`                   | Handling for when no vault marker is detected                                                                       |
| `vault.module.ts`                       | NestJS module; also registers `flavorGrenade/queryIndex` and `flavorGrenade/queryDoc` debug endpoints               |
| `handlers/await-index-ready.handler.ts` | Handles `flavorGrenade/awaitIndexReady` — blocks until the initial vault scan is complete                           |

## Vault Modes

| Mode             | Trigger                      | Behavior                               |
| ---------------- | ---------------------------- | -------------------------------------- |
| `obsidian`       | `.obsidian/` directory found | Scans all `.md` files under vault root |
| `flavor-grenade` | `.flavor-grenade.toml` found | Scans all `.md` files under vault root |
| `single-file`    | No marker found              | Indexes only the opened document       |
