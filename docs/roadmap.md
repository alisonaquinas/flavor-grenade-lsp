---
title: flavor-grenade-lsp — Feature Roadmap
tags: [meta, roadmap, phases]
aliases: [roadmap, release plan, phase plan]
updated: 2026-04-21
current-version: 0.1.2
---

# flavor-grenade-lsp — Feature Roadmap

This file tracks the phase-by-phase delivery plan for flavor-grenade-lsp from initial scaffold to first release. Each phase has a name, status, and key deliverable. Detailed per-phase implementation plans live in `plans/`.

> [!NOTE]
> Status values: `planned` | `in-progress` | `complete` | `blocked`
> All v1 phases (0–13) are **complete** as of 2026-04-17. Current version: **0.1.2**.
> Active work: VS Code extension packaging and Marketplace publishing (`feature/vs-code`).

## Phase Table

| # | Phase Name | Status | Key Deliverable | Completed |
|---|---|---|---|---|
| 0 | Documentation Scaffold | complete | All `docs/` files written and committed | 2026-04-17 |
| 1 | Project Scaffold | complete | NestJS + Bun initialised; repo structure; CI skeleton; `src/main.ts` stdio entry point | 2026-04-17 |
| 2 | LSP Transport | complete | JSON-RPC Content-Length framing; capability negotiation; `initialize` / `initialized` / `shutdown` / `exit` handshake | 2026-04-17 |
| 3 | OFM Parser | complete | Full OFM AST: wiki-links, embeds, block refs, tags, callouts, frontmatter, math, Obsidian comments | 2026-04-17 |
| 4 | Vault Index | complete | Vault detection (`.obsidian/` + `.flavor-grenade.toml`); file watcher; DocId; FolderLookup; single-file mode | 2026-04-17 |
| 5 | Wiki-Link Resolution | complete | Diagnostics FG001–FG003; go-to-def; find-refs; wiki-link completion (file-stem default) | 2026-04-17 |
| 6 | Tags | complete | Tag indexing with hierarchy; tag completion; tag find-references; tag-to-yaml code action | 2026-04-17 |
| 7 | Embeds | complete | Embed resolution; FG004 broken-embed diagnostic; hover preview for `.md` embeds | 2026-04-17 |
| 8 | Block References | complete | `^blockid` indexing as `BlockAnchorDef`; `CrossBlock` ref; FG005 diagnostic; go-to-def; find-refs; completion | 2026-04-17 |
| 9 | Completions | complete | Full completion provider: wiki-links, heading completion, block-ref completion, tags, callout types, inline links | 2026-04-17 |
| 10 | Navigation | complete | Go-to-def for all ref types; find-refs for all def types; code lens "N references" above headings and block anchors | 2026-04-17 |
| 11 | Rename | complete | Heading rename (all `[[doc#heading]]` updated); file rename via `workspace/willRenameFiles`; prepare-rename | 2026-04-17 |
| 12 | Code Actions | complete | TOC generation (`fg.toc`); create-missing-file (`fg.createMissingFile`); tag-to-yaml (`fg.tagToYaml`); workspace symbols; document symbols; semantic tokens | 2026-04-17 |
| 13 | CI & Delivery | complete | Bun bundle; cross-platform binaries; CI gates (lint, test, integration); release pipeline | 2026-04-17 |

## Phase Details

### Phase 1 — Project Scaffold

Establish the repository skeleton. NestJS application initialised with Bun as the runtime. Directory structure matches [[architecture/overview]]. `src/main.ts` reads from `process.stdin` and writes to `process.stdout` using Content-Length framing (stub — no protocol handling yet). ESLint, Prettier, and TypeScript strict mode configured. CI pipeline runs typecheck and lint on every push.

Implementation plan: [[plans/phase-01-scaffold]]

### Phase 2 — LSP Transport

Implement the full JSON-RPC Content-Length framing layer. Handle `initialize`, `initialized`, `shutdown`, and `exit` lifecycle messages. Advertise capabilities: `textDocumentSync: Full` (per [[ADR004-text-sync-strategy]]), semantic tokens, completion, hover, go-to-definition, references, document symbols, workspace symbols, rename, code actions, code lens. Return stub responses for all unimplemented methods rather than errors.

Implementation plan: [[plans/phase-02-lsp-transport]]

### Phase 3 — OFM Parser

Write the OFM parser producing an AST for every OFM construct defined in [[ofm-spec/index]]. The parser must correctly handle: wiki-links with optional heading and alias segments; embed links; block reference anchors (line-end `^id`); inline tags (`#tag/sub`); callouts (`> [!TYPE]`); YAML frontmatter; display math (`$$`); inline math (`$`); Obsidian comments (`%%`); Templater expressions (`<%`). Each construct maps to a named AST node type. The parser is covered by unit tests referencing OFM rule codes.

Implementation plan: [[plans/phase-03-ofm-parser]]

### Phase 4 — Vault Index

Implement vault detection per [[ADR003-vault-detection]]. Walk the vault root collecting all `.md` files, assign each a `DocId`, and build `FolderLookup` for resolving relative paths. Start a file watcher (`Bun.watch()`) to keep the index fresh as files are created, renamed, or deleted. Implement single-file mode fallback. Parse and cache frontmatter (aliases, tags) for every document.

Implementation plan: [[plans/phase-04-vault-index]]

### Phase 5 — Wiki-Link Resolution

Implement the reference resolver for `[[target]]`, `[[target#heading]]`, and `[[target|alias]]` patterns. Raise FG001 (broken), FG002 (ambiguous), and FG003 (malformed) diagnostics. Implement go-to-definition (jump to target document or heading). Implement find-references (find all links to a document or heading). Implement wiki-link completion using the style configured by `completion.wiki.style` (default `file-stem` per [[ADR005-wiki-style-binding]]).

Implementation plan: [[plans/phase-05-wiki-links]]

### Phase 6 — Tags

Index all `#tag` occurrences in document bodies and `tags:` frontmatter keys. Build a tag occurrence map keyed by full tag path. Support hierarchical tag queries (`#project` matches `#project/active`). Implement tag completion (offer all vault tags). Implement find-references for tags. Implement the `fg.tagToYaml` code action to move inline body tags to frontmatter.

Implementation plan: [[plans/phase-06-tags]]

### Phase 7 — Embeds

Resolve `![[target]]` embeds against the vault index. Raise FG004 (broken embed) when target resolves to zero files. Implement hover for embeds: show file type, file size, and for `.md` embeds the first paragraph of the target document. See [[features/hover]].

Implementation plan: [[plans/phase-07-embeds]]

### Phase 8 — Block References

Implement block anchor indexing as `BlockAnchorDef` per [[ADR006-block-ref-indexing]]. Implement `CrossBlock` ref type in `RefGraph`. Raise FG005 diagnostic for broken block refs. Implement go-to-definition for `[[doc#^id]]`. Implement find-references for `^blockid` anchors. Implement completion: after `[[doc#^`, offer known block ids. Implement code lens above each `^blockid`.

Implementation plan: [[plans/phase-08-block-refs]]

### Phase 9 — Completions

Consolidate all completion providers from phases 5–8 into a unified `CompletionProvider`. Implement heading completion (`[[doc#` → offer headings from resolved doc). Implement inline link completion (Markdown `[text](` prefix). Implement callout type completion (`> [!` → 13 standard types). Apply `completion.candidates` cap (default 50) with `isIncomplete: true` when the list is truncated. See [[features/completions]].

Implementation plan: [[plans/phase-09-completions]]

### Phase 10 — Navigation

Implement `textDocument/definition` for all ref types: wiki-link → document, `[[doc#heading]]` → heading, `[[doc#^id]]` → block anchor, `![[embed]]` → file, `#tag` → first occurrence. Implement `textDocument/references` for all def types. Implement `textDocument/codeLens` returning "N references" above headings and block anchors. See [[features/navigation]] and [[features/code-lens]].

Implementation plan: [[plans/phase-10-navigation]]

### Phase 11 — Rename

Implement `textDocument/prepareRename` (reject non-renameable positions). Implement `textDocument/rename` for headings (update all `[[doc#heading]]` refs) and for files via `workspace/willRenameFiles` (update all `[[doc]]` refs). Style binding: respect active `completion.wiki.style`. See [[features/rename]].

Implementation plan: [[plans/phase-11-rename]]

### Phase 12 — Code Actions

Implement `textDocument/codeAction` for three actions: `fg.toc` (insert or update `<!-- TOC -->` block), `fg.createMissingFile` (create target file for broken wiki-link), `fg.tagToYaml` (move body tags to frontmatter). Also implement `workspace/symbol` and `textDocument/documentSymbol` providers, semantic token highlighting for OFM elements, and the FG006 (non-breaking space) quick-fix diagnostic. See [[features/code-actions]].

Implementation plan: [[plans/phase-12-code-actions]]

### Phase 13 — CI & Delivery

Bundle the server with Bun (`bun build --compile`). Build cross-platform binaries for Linux x64, macOS ARM64, macOS x64, and Windows x64. CI gates: typecheck, lint, unit tests, integration tests (spawn server, exchange LSP messages over stdio, assert responses). Release pipeline tags a GitHub release and attaches binaries. Publish to npm as `@flavor-grenade/lsp-server` for editor plugin convenience.

Implementation plan: [[plans/phase-13-ci-delivery]]

## VS Code Extension Phases (`feature/vs-code`)

Packaging flavor-grenade-lsp as a VS Code Marketplace extension with bundled platform-specific binaries. Design: [[superpowers/specs/2026-04-21-vscode-extension-design]]. Distribution strategy: [[ADR015-platform-specific-vsix]].

### Extension Phase Table

| # | Phase Name | Status | Key Deliverable | Completed |
|---|---|---|---|---|
| R | Publishing Research | complete | Research report covering manifest, packaging, CI/CD, security | 2026-04-21 |
| E1 | Extension Scaffold | planned | `extension/` directory with `package.json`, `tsconfig.json`, esbuild config; `npm run build:extension` exits 0 | — |
| E2 | LanguageClient Core | planned | `extension.ts` with binary resolution, `LanguageClient` config, activate/deactivate lifecycle; server spawns in Extension Development Host | — |
| E3 | Status Bar & Commands | planned | Status bar widget showing vault state; 3 palette commands (restart, rebuild, output); config change watcher | — |
| E4 | Packaging & Local Test | planned | `.vscodeignore`, Marketplace assets (README, CHANGELOG, LICENSE, icon); `vsce package` produces installable VSIX | — |
| E5 | CI/CD Pipeline | planned | `extension-release.yml` with 7-target matrix build; tag-triggered publish via `VSCE_PAT` | — |

### Extension Phase Details

#### Phase R — Publishing Research

Research report covering VS Code extension manifest requirements, VSIX packaging, PAT-based publisher identity, CI/CD automation with `@vscode/vsce`, security model, and Marketplace policy. Used to inform the extension design spec and ADR015.

Reference: [[research/vscode-extension-publishing]]

#### Phase E1 — Extension Scaffold

Create the `extension/` directory at the repo root with its own `package.json` (extension manifest with identity, activation events, contributes, configuration), `tsconfig.json` (Node16 target for VS Code extension host), and esbuild bundling. Stub `extension.ts` exports empty `activate`/`deactivate`. Gate: `npm run build:extension` produces `dist/extension.js`.

Implementation plan: [[plans/phase-E1-extension-scaffold]]

#### Phase E2 — LanguageClient Core

Implement 2-tier binary resolution (user setting → bundled binary at `server/flavor-grenade-lsp[.exe]`). Configure `LanguageClient` v9.x with Executable ServerOptions over stdio. Wire `activate()` and `deactivate()` lifecycle. Gate: extension activates and spawns the server in VS Code Extension Development Host; LSP initialization handshake succeeds.

Implementation plan: [[plans/phase-E2-languageclient-core]]

#### Phase E3 — Status Bar & Commands

Add status bar widget listening to the `flavorGrenade/status` custom notification (initializing → indexing → ready → error). Register three palette commands: Restart Server (`client.restart()`), Rebuild Index (`workspace/executeCommand`), Show Output (`outputChannel.show()`). Add `onDidChangeConfiguration` watcher to restart on `server.path` changes. Gate: commands appear in palette; status bar reflects server state transitions.

Implementation plan: [[plans/phase-E3-status-bar-commands]]

#### Phase E4 — Packaging & Local Test

Add Marketplace assets (`README.md`, `CHANGELOG.md`, `LICENSE`, 256×256 PNG icon). Package with `vsce package` for host platform. Verify VSIX contents (only `dist/`, `server/`, manifest, and assets ship). Install locally and smoke test: completions, diagnostics, commands, status bar. Gate: `vsce package` produces installable VSIX; manual test passes end-to-end.

Implementation plan: [[plans/phase-E4-packaging-local-test]]

#### Phase E5 — CI/CD Pipeline

Create `extension-release.yml` workflow triggered by `ext-v*` tags. 7-target build matrix cross-compiles server binaries on `ubuntu-latest` via Bun, packages platform-specific VSIXs, and publishes all 7 to the Marketplace in a gated publish job. Gate: all 7 VSIXs build successfully on tag push.

Implementation plan: [[plans/phase-E5-ci-cd-pipeline]]

### Extension Phase Dependencies

```text
Phase R ──► Phase E1 ──► Phase E2 ──► Phase E3
                                          │
                                       Phase E4 ──► Phase E5
```

Phases are strictly sequential. E3 requires E2's `LanguageClient` to wire commands and status bar into. E4 requires E3 to have a complete extension for packaging. E5 requires E4 to have verified local packaging.

## Feature Backlog (Post-v1)

These features are out of scope for the initial release. Recorded to avoid scope creep.

| Feature | Notes |
|---|---|
| HTTP+SSE transport | Reserved per [[ADR001-stdio-transport]]; requires separate server startup path |
| Dataview passthrough | Dataview query blocks detected but treated as opaque; no query evaluation |
| Templater completion | Templater expression `<% %>` nodes detected; completions deferred |
| Incremental sync default | Currently opt-in; may become default after editor compatibility data is gathered |
| Multi-root workspace | Multiple vault roots in a single LSP session; requires session-level isolation |
| Remote vault (HTTP) | Vault files fetched over HTTP (e.g., Obsidian Sync API); requires async file access |
| Dataview schema | Infer field names from Dataview queries for frontmatter key completion |

## Related

- [[index]]
- [[AGENTS]]
- [[architecture/overview]]
- [[adr/ADR001-stdio-transport]]
- [[adr/ADR003-vault-detection]]
- [[adr/ADR006-block-ref-indexing]]
