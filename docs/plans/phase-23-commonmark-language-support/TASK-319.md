---
id: "TASK-319"
title: "Add CommonMark diagnostics and LSP features"
type: task
status: red
priority: high
phase: 23
parent: "FEAT-049"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-049"]
tags: [tickets/task, "phase/23", markdown-flavor, "commonmark"]
aliases: ["TASK-319"]
---

# Add CommonMark diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the commonmark flavor using [[docs/research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying commonmark behavior through flavor state.
- Record CommonMark signature behavior: standardized CommonMark block and inline behavior without GFM or Obsidian extensions.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-011 - CommonMark Parser And Analysis|MF-U-011]] | Profile and parser behavior for commonmark. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor commonmark. |
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

- [ ] commonmark behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for commonmark.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Navigation coverage includes definition, references, document links, document symbols, and folding for commonmark.
- [ ] Rename coverage is implemented for safe local commonmark symbols or rejected with an explicit disposition.
- [ ] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> LSP scope confirmed: diagnostics and completions must apply CommonMark-specific
> portability rules while preserving local Markdown link navigation and keeping
> Obsidian-only completion/navigation/rename surfaces inactive.
> Focused RED coverage fails because CommonMark portability diagnostics do not
> emit `FG102` and CommonMark still receives wiki-link completions.
> Command: `bun test src/parser/__tests__/markdown-flavor-parser-analysis.test.ts src/resolution/__tests__/diagnostic-service.test.ts src/completion/__tests__/completion-router.test.ts src/test/integration/markdown-flavor.test.ts`.
> Status: `red`.
