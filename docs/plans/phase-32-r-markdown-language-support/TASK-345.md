---
id: "TASK-345"
title: "Implement R Markdown parser semantics"
type: task
status: open
priority: high
phase: 32
parent: "FEAT-058"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-058"]
tags: [tickets/task, "phase/32", markdown-flavor, "r-markdown"]
aliases: ["TASK-345"]
---

# Implement R Markdown parser semantics

## Description

Deliver parser/profile semantics for the r-markdown flavor using [[docs/research/r-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying r-markdown behavior through flavor state.
- Record R Markdown signature behavior: YAML metadata, executable code chunk fences, chunk options, math, and document-output metadata without running code.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]] | Profile and parser behavior for r-markdown. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor r-markdown. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/r-markdown-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [ ] r-markdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for r-markdown.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `RMarkdownParser.parse(text, opaqueRegions)` for YAML
> metadata references, fenced chunk headers, chunk labels/options, inline R
> markers, and malformed local chunk boundaries. Chunks will be indexed only
> when effective flavor is `r-markdown`; no code execution or package/runtime
> lookup is allowed.
