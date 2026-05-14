---
id: "TASK-349"
title: "Add Reddit Markdown diagnostics and LSP features"
type: task
status: done
priority: high
phase: 33
parent: "FEAT-059"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-059"]
tags: [tickets/task, "phase/33", markdown-flavor, "reddit"]
aliases: ["TASK-349"]
---

# Add Reddit Markdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the reddit flavor using [[docs/research/reddit-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying reddit behavior through flavor state.
- Record Reddit Markdown signature behavior: Reddit platform syntax, spoilers, superscript conventions, subreddit/user links, and portability diagnostics.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]] | Profile and parser behavior for reddit. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor reddit. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/resolution/diagnostic-service.ts` |
| Source | `src/completion/completion-router.ts` |
| Source | `src/handlers/document-symbol.handler.ts` |
| Source | `src/handlers/folding-range.handler.ts` |
| Source | `src/handlers/semantic-tokens.handler.ts` |
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

- [x] reddit behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor LSP fixtures proving inactive constructs do not receive diagnostics, completions, navigation, hover, semantic tokens, or rename edits for reddit.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Navigation coverage includes definition, references, document links, document symbols, and folding for reddit.
- [x] Rename coverage is implemented for safe local reddit symbols or rejected with an explicit disposition.
- [x] Host/conversion non-local boundaries use the shared Phase 20 classifier and do not emit local diagnostics, navigation, or rename edits.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> LSP work will expose Reddit portability diagnostics, spoiler/superscript
> completions, table and host-reference symbols, table folding, semantic
> tokens, analysis counts, and non-local host-reference disposition. Live
> Reddit lookup and Rich Text rendering are out of scope.

> [!FAIL] Step D RED - 2026-05-13
> Status set to `red`. Focused RED failed for completion label `Reddit
> spoiler`, document symbols, folding, semantic token data, diagnostics
> `FG701` and `FG702`, and spawned-server query counts. `bun run lint
> --max-warnings 0` passed.

> [!SUCCESS] Step D GREEN - 2026-05-13
> Status set to `green`. Added Reddit portability diagnostics, spoiler and
> superscript completions, document symbols, table folding, semantic tokens,
> and `queryOpenDoc` counts. Focused LSP tests passed.

> [!SUCCESS] Done - 2026-05-13
> Status set to `done`. Phase 33 local gate passed and trace docs were updated.
