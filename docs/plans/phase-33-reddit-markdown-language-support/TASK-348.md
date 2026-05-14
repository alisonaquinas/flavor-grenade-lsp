---
id: "TASK-348"
title: "Implement Reddit Markdown parser semantics"
type: task
status: done
priority: high
phase: 33
parent: "FEAT-059"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-059"]
tags: [tickets/task, "phase/33", markdown-flavor, "reddit"]
aliases: ["TASK-348"]
---

# Implement Reddit Markdown parser semantics

## Description

Deliver parser/profile semantics for the reddit flavor using [[docs/research/reddit-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying reddit behavior through flavor state.
- Record Reddit Markdown signature behavior: Reddit platform syntax, spoilers, superscript conventions, subreddit/user links, and portability diagnostics.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |
| FlavorLSP.Profile.SignatureCoverage | AUD-S-005 |
| FlavorLSP.Parser.ProfileDispatch | AUD-S-001 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]] | Profile and parser behavior for reddit. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor reddit. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/reddit-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [x] reddit behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for reddit.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `RedditParser.parse(text, opaqueRegions)` for spoiler,
> superscript, strikethrough, table, ordered-list marker, URL-scheme, and
> `r/` or `u/` host-reference shapes. Constructs will be indexed only when
> effective flavor is `reddit`; no Reddit API lookup is allowed.

> [!FAIL] Step D RED - 2026-05-13
> Status set to `red`. `bun test
> src/parser/__tests__/markdown-flavor-parser-analysis.test.ts
> src/resolution/__tests__/diagnostic-service.test.ts
> src/completion/__tests__/completion-router.test.ts
> src/handlers/__tests__/folding-range.handler.test.ts
> src/handlers/__tests__/document-symbol.handler.test.ts
> src/handlers/__tests__/semantic-tokens.handler.test.ts
> src/test/integration/markdown-flavor.test.ts` failed as expected because
> Reddit parser/index fields and profile surfaces are not implemented yet.

> [!SUCCESS] Step D GREEN - 2026-05-13
> Status set to `green`. Added `src/parser/reddit-parser.ts`, Reddit index
> fields, `OFMParser` dispatch, empty-index entries, and profile
> `implemented` status. Focused parser analysis passed.

> [!SUCCESS] Done - 2026-05-13
> Status set to `done`. Phase 33 local gate passed and trace docs were updated.
