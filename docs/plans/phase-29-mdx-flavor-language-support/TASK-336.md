---
id: "TASK-336"
title: "Implement MDX flavor parser semantics"
type: task
status: done
priority: high
phase: 29
parent: "FEAT-055"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-055"]
tags: [tickets/task, "phase/29", markdown-flavor, "mdx"]
aliases: ["TASK-336"]
---

# Implement MDX flavor parser semantics

## Description

Deliver parser/profile semantics for the mdx flavor using [[docs/research/mdx-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying mdx behavior through flavor state.
- Record MDX signature behavior: JSX elements, expressions, imports, exports, and Markdown interop without taking over the MDX language mode.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]] | Profile and parser behavior for mdx. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor mdx. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/mdx-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [x] mdx behavior is implemented behind the flavor model.
- [x] Tests cover positive and portability/unsupported syntax cases.
- [x] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for mdx.
- [x] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [x] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `MdxParser.parse(text, opaqueRegions)` for ESM
> declarations, JSX element regions, JSX expression regions, component
> references, and malformed local MDX boundaries. MDX regions will be treated as
> opaque for Markdown token parsing where local MDX syntax owns the text.

> [!INFO] RED - 2026-05-13
> Added failing parser/profile coverage for MDX ESM declarations, JSX elements,
> expression regions, MDX opaque boundaries, inactive Obsidian syntax, and
> implemented MDX surface status.

> [!INFO] GREEN - 2026-05-13
> Implemented `MdxParser.parse(text, opaqueRegions)`, MDX index types, opaque
> MDX regions, OFM parser dispatch, and implemented profile surface status.
> Focused parser/profile coverage passed locally.

> [!INFO] Done - 2026-05-13
> PR #80 CI run `25830191328` passed. Parser/profile work is complete for the
> Phase 29 local MDX scope.
