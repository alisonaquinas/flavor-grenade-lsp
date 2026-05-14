---
id: "TASK-351"
title: "Implement Stack Overflow Markdown parser semantics"
type: task
status: red
priority: high
phase: 34
parent: "FEAT-060"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-060"]
tags: [tickets/task, "phase/34", markdown-flavor, "stack-overflow"]
aliases: ["TASK-351"]
---

# Implement Stack Overflow Markdown parser semantics

## Description

Deliver parser/profile semantics for the stack-overflow flavor using [[docs/research/stack-overflow-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying stack-overflow behavior through flavor state.
- Record Stack Overflow Markdown signature behavior: technical-writing Markdown, code fence behavior, tags, spoilers, tables, and Stack Overflow portability diagnostics.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-022 - Stack Overflow Markdown Parser And Analysis|MF-U-022]] | Profile and parser behavior for stack-overflow. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor stack-overflow. |
| [[docs/test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/parser/stack-overflow-parser.ts` |
| Source | `src/parser/ofm-parser.ts` |
| Source | `src/parser/types.ts` |
| Source | `src/markdown-flavor/markdown-flavor-profiles.ts` |
| Test | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `docs/bdd/features/markdown-flavor-dialects.feature` |

## Definition of Done

- [ ] stack-overflow behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for stack-overflow.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Step C implementation detail - 2026-05-13
> Parser work will add `StackOverflowParser.parse(text, opaqueRegions)` for
> Stack Exchange tag references, spoiler blockquotes, syntax-highlighting
> directives, fence language hints, GFM-style tables, and comment-surface
> portability markers. Constructs will be indexed only when effective flavor is
> `stack-overflow`; no Stack Exchange API lookup is allowed.

> [!FAIL] Step D RED - 2026-05-13
> Status set to `red`. Focused RED failed because Stack Overflow parser/index
> fields and profile surfaces are not implemented yet.
