---
title: "Phase 35: Markdown Flavor Config Files Implementation"
phase: 35
status: active
tags: [plans, markdown-flavor, configuration, mdfignore, mdfattributes]
aliases: [Phase 35, Markdown Flavor Config Files Implementation]
updated: 2026-05-29
---

# Phase 35: Markdown Flavor Config Files Implementation

| Field | Value |
|---|---|
| Phase | 35 |
| Title | Markdown Flavor Config Files Implementation |
| Status | active |
| Gate | `.mdfignore` and `.mdfattributes` drive visibility and effective Markdown context end to end |
| Depends on | Phase 20, Phase E15, PR #157 specification updates |

## Objective

Implement the configuration model described by
[[docs/features/markdown-flavor-config-files]] and
[[docs/design/markdown-flavor-auto-detection]]. Flavor Grenade must use
`.mdfignore` as the visibility gate and `.mdfattributes` as the only persistent
file/directory flavor assignment mechanism. Auto Detect remains independent:
configuration resolution may request Auto Detect, but Auto Detect does not read
configuration files.

Implementation work will run on `feature/mdf-config-implementation` and target
`develop` per repository branching rules. The release delta remains relative to
`main`.

## Current-State Assessment

The branch has partial implementation in place, but it is not complete. The
current state is:

- `src/markdown-flavor/mdf-config-files.ts` provides confined `.mdfignore` and
  `.mdfattributes` loading, Git-style pattern matching, visibility resolution,
  and attribute cascade.
- `src/vault/vault-scanner.ts` skips ignored Markdown files and excludes
  `.mdfignore` / `.mdfattributes` from asset indexing.
- `src/markdown-flavor/markdown-flavor-state.ts` accepts `.mdfattributes`
  outcomes before Auto Detect while preserving Auto Detect for absent,
  reset, or `flavor=auto` outcomes.
- `src/markdown-flavor/project-markdown-config-files.ts` and
  `src/vault/vault-detector.ts` now treat `.mdfignore` and `.mdfattributes` as
  Flavor Grenade config markers instead of legacy `.flavor-grenade.*` or
  `.editorconfig` markers.
- Remaining work includes ignored-open-document inactivity, watcher refresh,
  removal/quarantine of remaining legacy assignment payloads, extension
  scope-prompt `.mdfattributes` writes, and end-to-end acceptance coverage.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]] | Run Auto Detect only after visibility and config resolution request it |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.OverridePersistence]] | Persist selector choices only through `.mdfattributes` selected-file or directory rules |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Server resolves authoritative effective context from config files and document evidence |
| [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]] | Refresh analysis when `.mdfignore` or `.mdfattributes` changes |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Parser.ProfileDispatch]] | Parse each visible file with the resolved effective flavor and structured profile flags |
| [[docs/requirements/technical/security-input-validation#Security.Input.ProjectConfigSafety]] | Confine and validate config-file reads before applying patterns or attributes |
| [[docs/requirements/functional/security-vault-confinement#Security.Vault.ProjectConfigConfinement]] | Stop config-file discovery at the active vault/workspace boundary |
| [[docs/features/markdown-flavor-config-files]] | Implement Git-style `.mdfignore` and `.mdfattributes` semantics |
| [[docs/design/markdown-flavor-auto-detection]] | Preserve Auto Detect as a separate resolver |

## Scope

### In Scope

- Server-side discovery for `.mdfignore` and `.mdfattributes` from vault root to
  the target file's directory.
- Git-style pattern support needed by the spec: comments, escapes, anchored
  patterns, unanchored patterns, directory patterns, `*`, `?`, `**`, and
  negation.
- `.mdfignore` visibility gating before file indexing and before open-document
  feature handling.
- `.mdfattributes` attribute cascade for `flavor`, `!flavor`,
  `structured_profiles`, `!structured_profiles`, and selector negation.
- Default Auto Detect for all visible Markdown files when no config file
  applies.
- Structured profile flags resolved independently from the base flavor.
- File-watcher refresh when `.mdfignore` or `.mdfattributes` appears, changes, or
  disappears.
- VS Code selector flow: flavor picker followed by scope picker.
- Selector writes to `.mdfattributes` for selected file and all Markdown files in
  the active file's directory.
- Auto Detect selector behavior that removes or resets the matching `flavor`
  assignment at the chosen scope.
- Removal or deactivation of legacy file/directory flavor assignment through
  `.flavor-grenade.*`, `.editorconfig`, and VS Code settings.
- Unit, integration, BDD, and extension tests that prove the new model.

### Out of Scope

- Adding new Markdown dialects.
- Changing parser behavior unrelated to effective flavor selection.
- Marketplace screenshots and final host validation evidence beyond the tests
  required to prove this implementation.

## Implementation Order

1. Add RED tests for config-file parsing and matching.
2. Replace legacy project flavor config file list with `.mdfignore` and
   `.mdfattributes` discovery.
3. Implement confined config-file loading with size limits and content-safe
   diagnostics.
4. Implement `.mdfignore` matching and apply it in vault scanning, indexing, and
   open-document handling.
5. Implement `.mdfattributes` parsing, attribute cascade, resets, and
   structured-profile values.
6. Refactor `MarkdownFlavorState` so config outcome and Auto Detect are separate
   stages.
7. Remove legacy persistent flavor assignment paths from server and extension
   behavior.
8. Implement extension `.mdfattributes` writes and scope prompt behavior.
9. Add watcher refresh for config-file creates, updates, deletes, and renames.
10. Run full verification, update test matrices, and close tickets.

## Acceptance

- A root `.mdfignore` can hide matching Markdown files from the index.
- A nested `.mdfignore` can override earlier rules and re-include a file when
  traversal permits it.
- Ignored open files are inactive: no indexing, diagnostics, completion,
  navigation, hover, semantic tokens, rename, or graph entries.
- A root or nested `.mdfattributes` can assign a concrete flavor to matching
  visible files.
- Later/deeper `.mdfattributes` rules override earlier flavor attributes.
- `flavor=auto`, absent `flavor`, and `!flavor` all run Auto Detect without
  Auto Detect reading `.mdfattributes`.
- No config files means visible Markdown defaults to Auto Detect for the whole
  directory tree.
- `.obsidian/` still resolves to `obsidian` through Auto Detect.
- Generic visible Markdown still falls back to `commonmark`.
- The extension writes file-specific rules such as
  `guide.md flavor=gfm`.
- The extension writes directory-scope rules such as
  `/*.md flavor=gfm`.
- Selecting Auto Detect removes or resets the matching scoped flavor rule.
- Legacy `.flavor-grenade.*`, `.editorconfig` flavor directives, global
  `flavorGrenade.markdownFlavor`, and workspace-folder flavor settings no
  longer configure file/directory flavor assignment.
- Resource-specific client payloads are not the source of persistent flavor
  assignment.

## Gate Verification

```bash
bun test src/markdown-flavor/
bun test src/vault/
bun test src/lsp/handlers/__tests__/configuration.handler.test.ts
bun test src/test/integration/markdown-flavor.test.ts
bun test src/
bun run typecheck
bun run lint
bun run bdd
bun run lint:docs
cd extension
npm run compile
npm test
npm run test:host
```

## Tickets

Ticket index: [[docs/plans/phase-35-markdown-flavor-config-files-implementation/index]]

## Related

- [[docs/adr/ADR021-mdfignore-mdfattributes-flavor-configuration]]
- [[docs/features/markdown-flavor-config-files]]
- [[docs/design/markdown-flavor-auto-detection]]
- [[docs/plans/phase-20-markdown-flavor-server-propagation]]
- [[docs/plans/phase-E15-markdown-flavor-selector-settings]]
