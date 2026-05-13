---
id: "TASK-342"
title: "Implement Markdown Extra parser semantics"
type: task
status: open
priority: high
phase: 31
parent: "FEAT-057"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-057"]
tags: [tickets/task, "phase/31", markdown-flavor, "markdown-extra"]
aliases: ["TASK-342"]
---

# Implement Markdown Extra parser semantics

## Description

Deliver parser/profile semantics for the markdown-extra flavor using [[docs/research/markdown-extra-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying markdown-extra behavior through flavor state.
- Record Markdown Extra signature behavior: definition lists, footnotes, abbreviations, fenced code blocks, tables, and attributes.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]] | Profile and parser behavior for markdown-extra. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor markdown-extra. |
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

- [ ] markdown-extra behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
