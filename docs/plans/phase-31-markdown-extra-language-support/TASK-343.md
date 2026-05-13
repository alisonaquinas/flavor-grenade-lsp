---
id: "TASK-343"
title: "Add Markdown Extra diagnostics and LSP features"
type: task
status: done
priority: high
phase: 31
parent: "FEAT-057"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-057"]
tags: [tickets/task, "phase/31", markdown-flavor, "markdown-extra"]
aliases: ["TASK-343"]
---

# Add Markdown Extra diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the markdown-extra flavor using [[docs/research/markdown-extra-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying markdown-extra behavior through flavor state.
- Record Markdown Extra signature behavior: definition lists, footnotes, abbreviations, fenced code blocks, tables, and attributes.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]] | Profile and parser behavior for markdown-extra. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor markdown-extra. |
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

- [x] markdown-extra behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for markdown-extra.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Navigation coverage includes definition, references, document links, document symbols, and folding for markdown-extra.
- [x] Rename coverage is implemented for safe local markdown-extra symbols or rejected with an explicit disposition.
- [x] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> LSP work will expose Markdown Extra malformed-boundary diagnostics, table,
> definition-list, footnote, abbreviation, and attribute completions/symbols,
> folds, semantic tokens, analysis counts, and local-boundary disposition.
> Renderer, conversion, syntax-highlighter, and generated-output behavior are
> out of scope.

> [!FAILURE] RED validation - 2026-05-13
> Added LSP RED coverage for malformed-attribute diagnostics, Markdown Extra
> completions, document symbols, folding ranges, semantic tokens, query counts,
> and local boundary classification. Expected failures prove these surfaces are
> not yet wired.

> [!SUCCESS] GREEN validation - 2026-05-13
> Wired FG502 diagnostics, Markdown Extra completions, document symbols,
> folding, semantic tokens, spawned-server query counts, and local boundary
> evidence. Focused LSP tests now pass.

> [!SUCCESS] Done - 2026-05-13
> Diagnostics, completion, symbols, folding, semantic tokens, query counts,
> rename disposition, and host/conversion boundary evidence are complete for
> Phase 31.
