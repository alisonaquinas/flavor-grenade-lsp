---
title: "Phase 20: Markdown Flavor Server Propagation"
phase: 20
status: planned
tags: [plans, markdown-flavor, server, lsp]
aliases: [Phase 20, Markdown Flavor Server Propagation]
updated: 2026-05-13
---

# Phase 20: Markdown Flavor Server Propagation

| Field | Value |
|---|---|
| Phase | 20 |
| Title | Markdown Flavor Server Propagation |
| Status | planned |
| Gate | Effective flavor reaches server analysis and refreshes open documents |
| Depends on | Phase 19 |

## Objective

Make Markdown flavor real server state. This phase accepts configured flavor
values, resolves `auto`, refreshes open documents on changes, and gives parser,
diagnostic, completion, navigation, and semantic-token services an effective
flavor context.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]] | Resolve `auto` from vault/config/context signals |
| [[requirements/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Accept and apply effective flavor in server analysis |
| [[requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]] | Refresh open document analysis after flavor changes |
| [[test/markdown-flavor-unit-spec]] | Add configuration handler unit tests |
| [[test/markdown-flavor-integration-spec]] | Add spawned-server flavor propagation tests |
| [GAP-S-003](../gaps/markdown-flavor-gap-analysis.md) | Close missing server flavor configuration gap |
| [GAP-S-007](../gaps/markdown-flavor-gap-analysis.md) | Close flavor-blind parser/diagnostics gap |

## Scope

### In Scope

- `workspace/didChangeConfiguration` or equivalent server configuration path
  for `flavorGrenade.markdownFlavor`.
- Effective flavor resolver for explicit and `auto` settings.
- Flavor-bearing parse or analysis context.
- Initial profile gates for Original Markdown, CommonMark, and Obsidian.
- Refresh of diagnostics and feature caches for open documents.
- Spawned LSP integration tests for supported and unsupported flavor ids.

### Out of Scope

- Full parser implementation for every platform-specific dialect.
- VS Code selector persistence.
- Marketplace or README changes.

## Acceptance

- Supported flavor ids are accepted without server restart.
- Unsupported flavor ids are rejected without mutating active state.
- Generic Markdown resolves to CommonMark in `auto`.
- Obsidian vault Markdown resolves to Obsidian in `auto`.
- Original/CommonMark analysis does not treat Obsidian wiki links as core
  syntax.

## Gate Verification

```bash
bun test src/lsp/handlers/__tests__/configuration.handler.test.ts
bun test src/test/integration/markdown-flavor.test.ts
bun test src/
bun run typecheck
bun run lint
bun run bdd
bun run lint:docs
bun run build
```

## Tickets

Ticket index: [[plans/phase-20-markdown-flavor-server-propagation/index]]

## Related

- [[plans/phase-19-markdown-flavor-model-profiles]]
- [[gaps/markdown-flavor-gap-analysis]]
