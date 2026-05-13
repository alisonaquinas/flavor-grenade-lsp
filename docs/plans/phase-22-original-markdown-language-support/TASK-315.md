---
id: "TASK-315"
title: "Implement Original Markdown parser semantics"
type: task
status: in-progress
priority: high
phase: 22
parent: "FEAT-048"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-048"]
tags: [tickets/task, "phase/22", markdown-flavor, "original"]
aliases: ["TASK-315"]
---

# Implement Original Markdown parser semantics

## Description

Deliver parser/profile semantics for the original flavor using [[docs/research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying original behavior through flavor state.
- Record Original Markdown signature behavior: historical core Markdown without fenced code, pipe tables, task lists, wiki links, or callouts.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-010 - Original Markdown Parser And Analysis|MF-U-010]] | Profile and parser behavior for original. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor original. |
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

- [ ] original behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for original.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Implementation Notes

- Parser entry point: `OFMParser.parse(uri, text, version, { effectiveFlavor: 'original' })`.
- Add Original Markdown setext heading recognition while preserving ATX headings,
  indented code opacity, inline/reference links, and image parsing.
- Keep fenced code, pipe tables, task lists, wiki links, embeds, tags, callouts,
  frontmatter, math, JSX, and R chunks out of active Original syntax.
- RED tests: `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] RED - 2026-05-13
> Added `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` for
> Original Markdown setext headings, historical core syntax, inactive Obsidian
> constructs, and profile surface status before implementation is complete.
