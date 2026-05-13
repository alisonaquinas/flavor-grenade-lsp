---
id: "TASK-337"
title: "Add MDX diagnostics and LSP features"
type: task
status: done
priority: high
phase: 29
parent: "FEAT-055"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-055"]
tags: [tickets/task, "phase/29", markdown-flavor, "mdx"]
aliases: ["TASK-337"]
---

# Add MDX diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the mdx flavor using [[docs/research/mdx-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying mdx behavior through flavor state.
- Record MDX signature behavior: JSX elements, expressions, imports, exports, and Markdown interop without taking over the MDX language mode.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |
| FlavorLSP.Diagnostics.ProfileRules | AUD-S-001 |
| FlavorLSP.Completion.ProfileCandidates | AUD-S-001 |
| FlavorLSP.Navigation.ProfileResolution | AUD-S-003 |
| FlavorLSP.Hover.ProfileMetadata | AUD-X-002 |
| FlavorLSP.SemanticTokens.ProfileTokens | AUD-S-001 |
| FlavorLSP.Rename.ProfileSafety | AUD-S-002 |
| FlavorLSP.HostBoundary.NonLocalReferences | AUD-S-004 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]] | Profile and parser behavior for mdx. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor mdx. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/resolution/diagnostic-service.ts` |
| Source | `src/completion/completion-router.ts` |
| Source | `src/handlers/definition.handler.ts` |
| Source | `src/handlers/references.handler.ts` |
| Source | `src/handlers/document-symbol.handler.ts` |
| Source | `src/rename/prepare-rename.handler.ts` |
| Source | `src/rename/rename.handler.ts` |
| Source | `src/handlers/document-link.handler.ts` |
| Source | `src/handlers/folding-range.handler.ts` |
| Source | `src/handlers/semantic-tokens.handler.ts` |
| Source | `src/handlers/hover.handler.ts` |
| Source | `src/lsp/lsp.module.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `src/resolution/__tests__/diagnostic-service.test.ts` |
| Test | `src/handlers/__tests__/definition.handler.test.ts` |
| Test | `src/handlers/__tests__/references.handler.test.ts` |
| Test | `src/handlers/__tests__/document-symbol.handler.test.ts` |
| Test | `src/rename/__tests__/prepare-rename.handler.test.ts` |
| Test | `src/rename/__tests__/rename.handler.test.ts` |
| Test | `src/handlers/__tests__/document-link.handler.test.ts` |
| Test | `src/handlers/__tests__/folding-range.handler.test.ts` |
| Test | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Test | `src/handlers/__tests__/hover.handler.test.ts` |

## Definition of Done

- [x] mdx behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for mdx.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Navigation coverage includes definition, references, document links, document symbols, and folding for mdx.
- [x] Rename coverage is implemented for safe local mdx symbols or rejected with an explicit disposition.
- [x] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> LSP work will expose MDX diagnostics, completion snippets, document symbols,
> folds, semantic tokens, analysis counts, and renderer-bound classification.
> React/TypeScript symbol lookup, import resolution, MDX compilation, and
> JavaScript evaluation are out of scope.

> [!INFO] RED - 2026-05-13
> Added failing diagnostics, completion, document-symbol, folding,
> semantic-token, and renderer-boundary coverage for MDX LSP surfaces.

> [!INFO] GREEN - 2026-05-13
> Implemented MDX `FG401` boundary diagnostics, component/expression/export
> completions, document symbols, folding ranges, semantic tokens, query counts,
> and renderer-bound classification evidence. Focused LSP coverage passed
> locally.

> [!INFO] Done - 2026-05-13
> PR #80 CI run `25830191328` passed. MDX diagnostics and local LSP surfaces are
> complete for Phase 29; React/TypeScript integration remains deferred.
