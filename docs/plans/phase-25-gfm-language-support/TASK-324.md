---
id: "TASK-324"
title: "Implement GFM parser semantics"
type: task
status: red
priority: high
phase: 25
parent: "FEAT-051"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-051"]
tags: [tickets/task, "phase/25", markdown-flavor, "gfm"]
aliases: ["TASK-324"]
---

# Implement GFM parser semantics

## Description

Deliver parser/profile semantics for the gfm flavor using [[docs/research/github-flavored-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying gfm behavior through flavor state.
- Record GitHub Flavored Markdown signature behavior: tables, task lists, strikethrough, autolinks, and GitHub-oriented portability behavior.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-013 - GFM Parser And Analysis|MF-U-013]] | Profile and parser behavior for gfm. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor gfm. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/markdown-flavor-profiles.ts` |
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Source | `src/parser/gfm-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [ ] gfm behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for gfm.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `GfmParser.parse(text, opaqueRegions)` returning
> table, task-list, strikethrough, and extended-autolink entries. `OFMParser`
> will populate those entries only when the effective flavor is `gfm`.

> [!INFO] RED - 2026-05-13
> Added failing parser/profile coverage for active GFM tables, task lists,
> strikethrough, extended autolinks, inert Obsidian syntax, and implemented
> GFM surface status.
