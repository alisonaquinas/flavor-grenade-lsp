---
id: "TASK-318"
title: "Implement CommonMark parser semantics"
type: task
status: red
priority: high
phase: 23
parent: "FEAT-049"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-049"]
tags: [tickets/task, "phase/23", markdown-flavor, "commonmark"]
aliases: ["TASK-318"]
---

# Implement CommonMark parser semantics

## Description

Deliver parser/profile semantics for the commonmark flavor using [[docs/research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying commonmark behavior through flavor state.
- Record CommonMark signature behavior: standardized CommonMark block and inline behavior without GFM or Obsidian extensions.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-011 - CommonMark Parser And Analysis|MF-U-011]] | Profile and parser behavior for commonmark. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor commonmark. |
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

- [ ] commonmark behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for commonmark.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> Parser/profile scope confirmed: CommonMark owns fenced code, ATX/setext headings,
> inline/reference Markdown links, autolinks, HTML blocks, lists, and blockquotes.
> Obsidian wiki links, embeds, tags, and callouts remain inactive for this flavor.
> Focused RED coverage fails because CommonMark autolinks are not indexed and
> CommonMark profile surfaces remain planned.
> Command: `bun test src/parser/__tests__/markdown-flavor-parser-analysis.test.ts src/resolution/__tests__/diagnostic-service.test.ts src/completion/__tests__/completion-router.test.ts src/test/integration/markdown-flavor.test.ts`.
> Status: `red`.
