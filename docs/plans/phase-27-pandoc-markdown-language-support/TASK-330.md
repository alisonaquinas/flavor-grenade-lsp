---
id: "TASK-330"
title: "Implement Pandoc Markdown parser semantics"
type: task
status: done
priority: high
phase: 27
parent: "FEAT-053"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-053"]
tags: [tickets/task, "phase/27", markdown-flavor, "pandoc"]
aliases: ["TASK-330"]
---

# Implement Pandoc Markdown parser semantics

## Description

Deliver parser/profile semantics for the pandoc flavor using [[docs/research/pandoc-markdown-deep-research-report]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying pandoc behavior through flavor state.
- Record Pandoc Markdown signature behavior: metadata blocks, citations, math, attributes, extension toggles, and cross-reference-oriented behavior.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-015 - Pandoc Markdown Parser And Analysis|MF-U-015]] | Profile and parser behavior for pandoc. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor pandoc. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/markdown-flavor-profiles.ts` |
| Source | `src/parser/markdown-flavor-parser-analysis.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [x] pandoc behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for pandoc.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `PandocParser.parse(text, opaqueRegions)` for title
> blocks, citations, footnotes, attributes/labels, fenced Divs, and definition
> lists while keeping Obsidian-only constructs inert outside the Obsidian
> flavor.

> [!INFO] RED - 2026-05-13
> Added failing parser/profile coverage for Pandoc metadata, citations,
> definition lists, footnotes, fenced Divs, attributes/labels, inactive
> Obsidian syntax, and implemented Pandoc surface status.

> [!SUCCESS] GREEN - 2026-05-13
> Implemented `PandocParser`, parser index projection, and profile status for
> title blocks, citations, footnotes, attributes, fenced Divs, and definition
> lists. Targeted Phase 27 parser/LSP/integration tests passed locally.

> [!DONE] Done - 2026-05-13
> Exact Phase 27 local gate passed. Parser evidence and trace rows are updated.
