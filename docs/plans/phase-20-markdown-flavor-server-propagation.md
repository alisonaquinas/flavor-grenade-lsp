---
title: "Phase 20: Markdown Flavor Server Propagation"
phase: 20
status: in-review
tags: [plans, markdown-flavor, server, lsp]
aliases: [Phase 20, Markdown Flavor Server Propagation]
updated: 2026-05-13
---

# Phase 20: Markdown Flavor Server Propagation

| Field | Value |
|---|---|
| Phase | 20 |
| Title | Markdown Flavor Server Propagation |
| Status | in-review |
| Gate | Effective flavor reaches server analysis and refreshes open documents |
| Depends on | Phase 19 |

## Objective

Make Markdown flavor real server state. This phase accepts resource-specific
effective flavor payloads, resolves `.fgignore`/`.fgattributes` evidence,
keeps Auto Detect independent from configuration parsing, refreshes open
documents on changes, and gives parser, diagnostic, completion, navigation, and
semantic-token services an effective flavor context.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.AutoDetection]] | Resolve `auto` from marker, membership, and syntax/context signals after config resolution requests Auto Detect |
| [[docs/requirements/functional/ofmarkdown-language-mode#Extension.MarkdownFlavor.ServerPropagation]] | Accept and apply effective flavor in server analysis |
| [[docs/requirements/functional/vscode-extension-parity#Extension.MarkdownFlavor.Refresh]] | Refresh open document analysis after flavor changes |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Parser.ProfileDispatch]] | Provide effective flavor context to parser and analysis services |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Diagnostics.ProfileRules]] | Refresh diagnostics from the effective profile after flavor changes |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Completion.ProfileCandidates]] | Refresh completion context from the effective profile after flavor changes |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Navigation.ProfileResolution]] | Refresh navigation context from the effective profile after flavor changes |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Hover.ProfileMetadata]] | Provide effective profile metadata to hover services |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.SemanticTokens.ProfileTokens]] | Refresh semantic-token context from the effective profile after flavor changes |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.Rename.ProfileSafety]] | Provide effective profile context to rename safety checks |
| [[docs/requirements/functional/markdown-flavor-lsp#FlavorLSP.HostBoundary.NonLocalReferences]] | Add shared non-local host/conversion boundary classification |
| [[docs/requirements/technical/security-input-validation#Security.Input.ProjectConfigSafety]] | Validate `.fgignore`/`.fgattributes` evidence before it affects flavor state |
| [[docs/requirements/technical/security-input-validation#Security.Input.FlavorPropagationPayload]] | Validate resource-specific propagation payloads before state mutation |
| [[docs/requirements/functional/security-vault-confinement#Security.Vault.ProjectConfigConfinement]] | Confine `.fgignore`/`.fgattributes` discovery to the workspace/vault root |
| [[docs/test/markdown-flavor-unit-spec]] | Add configuration handler unit tests |
| [[docs/test/markdown-flavor-integration-spec]] | Add spawned-server flavor propagation tests |
| [GAP-S-003](../gaps/markdown-flavor-gap-analysis.md) | Close missing server flavor configuration gap |
| [GAP-S-007](../gaps/markdown-flavor-gap-analysis.md) | Close flavor-blind parser/diagnostics gap |

## Scope

### In Scope

- `workspace/didChangeConfiguration` or equivalent server configuration path
  for resource-specific `EffectiveMarkdownContext` payloads.
- Payload schema validation for resource-specific flavor maps, including size,
  enum, URI scheme, dangerous-key, resource ownership, and stale-entry checks.
- Confined, size-limited, schema-validated `.fgignore`/`.fgattributes`
  evidence.
- Effective flavor resolver for `.fgignore`, `.fgattributes` concrete flavors,
  `flavor=auto`, `!flavor`, and config-absent Auto Detect.
- Flavor-bearing parse or analysis context.
- Initial profile gates for Original Markdown, CommonMark, and Obsidian.
- Refresh of diagnostics and feature caches for open documents.
- Shared boundary classification for host-specific, renderer/conversion-bound,
  bibliography-bound, MDX/JSX, and execution-bound references before
  diagnostics, navigation, or rename treat a target as local.
- Spawned LSP integration tests for supported and unsupported flavor ids.
- Security fixtures for malformed propagation payloads and unsafe `.fgignore`
  or `.fgattributes` evidence.

### Out of Scope

- Full parser implementation for every platform-specific dialect.
- VS Code selector persistence.
- Marketplace or README changes.

## Acceptance

- Supported flavor ids are accepted without server restart.
- Unsupported flavor ids are rejected without mutating active state.
- `.fgignore` matched files are inactive and do not enter parsing or indexing.
- `.fgattributes` concrete flavor values override Auto Detect for matching
  visible files.
- Generic Markdown resolves to CommonMark in `auto`.
- Obsidian vault Markdown resolves to Obsidian in `auto`.
- Original/CommonMark analysis does not treat Obsidian wiki links as core
  syntax.
- Spawned-server integration evidence proves handler refresh, resource-specific
  effective flavor state, and host/conversion boundary classification across
  the process boundary.
- Invalid payloads, unsafe resource keys, unsafe `.fgignore`/`.fgattributes`
  evidence, and dangerous object keys are rejected before flavor state changes.

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

Ticket index: [[docs/plans/phase-20-markdown-flavor-server-propagation/index]]

## Related

- [[docs/plans/phase-19-markdown-flavor-model-profiles]]
- [[docs/gaps/markdown-flavor-gap-analysis]]
