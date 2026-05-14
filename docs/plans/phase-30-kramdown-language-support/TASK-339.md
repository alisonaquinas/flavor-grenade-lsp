---
id: "TASK-339"
title: "Implement kramdown parser semantics"
type: task
status: done
priority: high
phase: 30
parent: "FEAT-056"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-056"]
tags: [tickets/task, "phase/30", markdown-flavor, "kramdown"]
aliases: ["TASK-339"]
---

# Implement kramdown parser semantics

## Description

Deliver parser/profile semantics for the kramdown flavor using [[docs/research/kramdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying kramdown behavior through flavor state.
- Record kramdown signature behavior: block and span attributes, definition lists, footnotes, tables, math, and inline attribute lists.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-018 - kramdown Parser And Analysis|MF-U-018]] | Profile and parser behavior for kramdown. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor kramdown. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/kramdown-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [ ] kramdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for kramdown.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `KramdownParser.parse(text, opaqueRegions)` for
> attribute lists, explicit IDs, definition lists, pipe tables, footnotes, math
> blocks, and malformed local kramdown boundaries. kramdown-specific attribute
> regions will be indexed without enabling Obsidian-only parsing.

> [!FAILURE] RED validation - 2026-05-13
> Added parser RED coverage for kramdown attributes, definition lists, tables,
> footnotes, math blocks, inactive Obsidian syntax, and profile surface status.
> Expected failure: parser index lacks kramdown collections and the kramdown
> profile surfaces are still unimplemented.

> [!SUCCESS] GREEN validation - 2026-05-13
> Implemented `KramdownParser`, parser index types, OFM flavor dispatch, and
> implemented profile surface status. Focused kramdown parser tests now pass.

> [!SUCCESS] Done - 2026-05-13
> PR #81 CI run `25831274609` passed all checks. Ticket moved to `done`.
