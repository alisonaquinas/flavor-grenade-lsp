# AGENTS.md — flavor-grenade-lsp

## Scope

**Only work inside this repository.**

This directory (`flavor-grenade-lsp/`) is a fully independent git repository.
When a task is requested here, all changes, commits, and investigations must
stay within `flavor-grenade-lsp/`. Do not read, modify, or commit files in
sibling repositories (`markdownlint-obsidian/`, `marksman/`, `obsidian-linter/`,
`repo-docs-skills/`) even if a linting or tooling check appears to surface issues
there.

## Commands

```bash
bun install        # install deps
bun run build      # compile
bun run lint       # eslint src/
bun run typecheck  # tsc --noEmit
bun test           # unit tests
bun run test:bdd   # BDD cucumber suite
```

## Layout

```
flavor-grenade-lsp/
├── src/
│   ├── main.ts                  # NestJS bootstrap entry point
│   ├── transport/               # JSON-RPC framing and dispatch
│   ├── lsp/                     # LSP lifecycle, document store, notification handlers
│   │   ├── handlers/            # initialize, initialized, shutdown, exit, didOpen/Change/Close
│   │   └── services/            # CapabilityRegistry, DocumentStore, LifecycleState, StatusNotifier
│   ├── parser/                  # OFM document parser and token types
│   ├── vault/                   # Vault detection, scanning, indexing, file watching
│   │   └── handlers/            # await-index-ready handler
│   ├── resolution/              # Oracle, link resolver, diagnostics, ref graph
│   ├── completion/              # Completion router and per-trigger providers
│   ├── handlers/                # LSP request handlers (definition, references, rename, etc.)
│   ├── navigation/              # CodeLens and DocumentHighlight module
│   ├── rename/                  # PrepareRename and Rename module
│   ├── code-actions/            # Code action handlers and quick-fix actions
│   ├── tags/                    # TagRegistry (vault-wide tag index)
│   └── test/                    # Test infrastructure, BDD step defs, fixtures
├── docs/                        # Long-form design and requirements docs (excluded from well-documented scope)
├── dist/                        # Compiled output (gitignored)
├── AGENTS.md                    # This file
├── CHANGELOG.md
├── CLAUDE.md                    # Stub pointing to this file
├── CONCEPTS.md                  # Domain vocabulary
└── README.md
```

## Invariants

- **Single source of truth for documents**: `VaultIndex` is the only place
  parsed `OFMDoc` objects are stored. All handlers read from it; never
  maintain a second document cache.
- **DocId is vault-relative and extension-free**: `DocId` values are always
  relative paths from the vault root with the `.md` extension stripped
  (e.g. `notes/MyNote`, not `notes/MyNote.md`). Never store or compare absolute
  paths or extension-bearing strings as DocIds.
- **Opaque regions are parsed first**: The `OpaqueRegionMarker` pass must
  complete before any token parser (wiki-links, tags, etc.) runs so that
  tokens inside code/math/comment blocks are silently skipped.
- **RequestHandler must be async**: All lambdas passed to
  `dispatcher.onRequest(...)` must return `Promise<unknown>`. Synchronous
  handlers fail the TypeScript type check.
- **No cross-repo changes**: All edits must stay inside
  `flavor-grenade-lsp/`. Never touch sibling repositories.
- **Lint and typecheck must pass before commit**: Pre-commit hooks run
  `eslint src/` and `prettier --check`. Fix violations before committing;
  do not use `--no-verify`.

## Branch Convention

- `main` — releases
- `develop` — integration
- `feature/*` — work branches; open PRs against `develop`
