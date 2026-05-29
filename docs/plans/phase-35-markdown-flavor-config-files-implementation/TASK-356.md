---
id: "TASK-356"
title: "Apply .fgignore visibility to vault indexing and LSP surfaces"
type: task
status: partial
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-355"]
tags: [tickets/task, "phase/35", markdown-flavor, vault]
aliases: ["TASK-356"]
---

# Apply .fgignore Visibility To Vault Indexing And LSP Surfaces

## Work Scope

- Apply `.fgignore` before vault scanner parse/index work.
- Ensure ignored open documents remain inactive.
- Remove ignored documents from `VaultIndex`, `RefGraph`, tag indexes, and
  feature caches when a config-file change newly ignores them.
- Suppress diagnostics, completion, navigation, hover, semantic tokens, rename,
  references, and document symbols for ignored resources.
- Refresh affected resources when `.fgignore` files appear, change, disappear,
  or move.

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/vault/vault-scanner.ts` |
| Source | `src/vault/vault-index.ts` |
| Source | `src/vault/file-watcher.ts` |
| Source | `src/lsp/handlers/did-open.handler.ts` |
| Test | `src/vault/__tests__/vault-scanner.test.ts` |
| Test | `src/vault/__tests__/vault-index.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |

## Definition of Done

- [x] Root and nested `.fgignore` patterns change index membership.
- [x] Negation re-includes files when traversal permits it.
- [x] Ignored open files do not produce Flavor Grenade parse or diagnostic
      outputs.
- [ ] Watcher refresh handles config-file create, update, delete, and rename.

## Workflow Log

> [!FAIL] RED - 2026-05-29
> Status set to `red`. Added scanner tests for root `.fgignore` exclusion,
> nested `.fgignore` negation, and config files staying out of asset indexing.
> Expected failure: `VaultScanner` has not been wired to `.fgignore`
> visibility yet.

> [!SUCCESS] GREEN - 2026-05-29
> Status set to `green`. `VaultScanner` now applies `.fgignore` before
> document or asset indexing and skips `.fgignore` / `.fgattributes` files as
> assets. Focused scanner tests, typecheck, and lint pass.

> [!NOTE] PARTIAL - 2026-05-29
> Status corrected to `partial`. Scanner visibility is green, but open-document
> LSP inactivity and watcher refresh remain in scope for this ticket.

> [!SUCCESS] GREEN - 2026-05-29
> `DidOpenHandler` and `DidChangeHandler` now resolve `.fgignore` before
> parsing open documents. Ignored files stay in the editor document store, but
> their parse-cache entries are removed and diagnostics are cleared. Focused
> handler tests, typecheck, and lint pass.
