---
id: "TASK-334"
title: "Add MultiMarkdown diagnostics and LSP features"
type: task
status: green
priority: high
phase: 28
parent: "FEAT-054"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-054"]
tags: [tickets/task, "phase/28", markdown-flavor, "multimarkdown"]
aliases: ["TASK-334"]
---

# Add MultiMarkdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the multimarkdown flavor using [[docs/research/multimarkdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying multimarkdown behavior through flavor state.
- Record MultiMarkdown signature behavior: metadata, tables, footnotes, citations, labels, and cross-references.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]] | Profile and parser behavior for multimarkdown. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor multimarkdown. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/resolution/diagnostic-service.ts` |
| Source | `src/completion/completion-router.ts` |
| Source | `src/handlers/document-symbol.handler.ts` |
| Source | `src/handlers/folding-range.handler.ts` |
| Source | `src/handlers/semantic-tokens.handler.ts` |
| Source | `src/markdown-flavor/non-local-boundary-classifier.ts` |
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

- [ ] multimarkdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for multimarkdown.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Navigation coverage includes definition, references, document links, document symbols, and folding for multimarkdown.
- [ ] Rename coverage is implemented for safe local multimarkdown symbols or rejected with an explicit disposition.
- [ ] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> LSP work will expose MultiMarkdown diagnostics, completion snippets, document
> symbols, folds, semantic tokens, analysis counts, and export/citation
> boundary classification. No MultiMarkdown CLI, BibTeX, Pandoc, transclusion,
> or generated-output operation is in scope.

> [!INFO] RED - 2026-05-13
> Added failing diagnostics, completion, folding, document-symbol,
> semantic-token, and boundary coverage for MultiMarkdown LSP surfaces.

> [!INFO] GREEN - 2026-05-13
> Wired MultiMarkdown diagnostics, completions, document symbols, folding
> ranges, semantic tokens, and spawned-server analysis counts. Targeted LSP
> surface tests now pass.
