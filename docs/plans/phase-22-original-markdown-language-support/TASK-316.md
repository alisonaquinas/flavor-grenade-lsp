---
id: "TASK-316"
title: "Add Original Markdown diagnostics and LSP features"
type: task
status: done
priority: high
phase: 22
parent: "FEAT-048"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-048"]
tags: [tickets/task, "phase/22", markdown-flavor, "original"]
aliases: ["TASK-316"]
---

# Add Original Markdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the original flavor using [[docs/research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying original behavior through flavor state.
- Record Original Markdown signature behavior: historical core Markdown without fenced code, pipe tables, task lists, wiki links, or callouts.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-010 - Original Markdown Parser And Analysis|MF-U-010]] | Profile and parser behavior for original. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor original. |
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

- [x] original behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for original.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Navigation coverage includes definition, references, document links, document symbols, and folding for original.
- [x] Rename coverage is implemented for safe local original symbols or rejected with an explicit disposition.
- [x] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Implementation Notes

- Diagnostics entry point: `DiagnosticService.publishDiagnostics` should emit
  portability warnings for inactive Original Markdown constructs without
  resolving them as vault links.
- Completion entry point: `CompletionRouter.route` should suppress inactive
  Obsidian completions (`[[`, `![[`, `#tag`, `> [!`) when
  `doc.markdownFlavor === 'original'`, while retaining standard Markdown link
  completions.
- Navigation/document links/document symbols/folding/semantic tokens/rename:
  rely on the parsed Original index. Wiki/embeds/tags/callouts remain absent;
  headings and standard Markdown links remain active.
- RED tests: `src/resolution/__tests__/diagnostic-service.test.ts` and
  `src/completion/__tests__/completion-router.test.ts`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] RED - 2026-05-13
> Added failing diagnostic and completion coverage for Original Markdown
> portability warnings and inactive Obsidian completion routing before the LSP
> behavior is implemented.

> [!SUCCESS] GREEN - 2026-05-13
> Added FG101 Original Markdown portability diagnostics, completion suppression
> for inactive Obsidian syntax, spawned-server coverage, and applicability
> matrix evidence. Existing shared handlers cover local Markdown navigation,
> symbols, folding, hover, semantic tokens, and rename from the parsed index.
