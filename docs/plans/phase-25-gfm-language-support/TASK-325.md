---
id: "TASK-325"
title: "Add GFM diagnostics and LSP features"
type: task
status: open
priority: high
phase: 25
parent: "FEAT-051"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-051"]
tags: [tickets/task, "phase/25", markdown-flavor, "gfm"]
aliases: ["TASK-325"]
---

# Add GFM diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the gfm flavor using [[research/github-flavored-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying gfm behavior through flavor state.
- Record GitHub Flavored Markdown signature behavior: tables, task lists, strikethrough, autolinks, and GitHub-oriented portability behavior.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-013 - GFM Parser And Analysis|MF-U-013]] | Profile and parser behavior for gfm. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor gfm. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Planned Source/Test Paths

| Kind | Planned path |
|---|---|
| Source | `src/resolution/diagnostic-service.ts` |
| Source | `src/completion/completion-router.ts` |
| Source | `src/handlers/document-link.handler.ts` |
| Source | `src/handlers/folding-range.handler.ts` |
| Source | `src/handlers/semantic-tokens.handler.ts` |
| Source | `src/handlers/hover.handler.ts` |
| Test | `src/test/integration/markdown-flavor.test.ts` |
| Test | `src/resolution/__tests__/diagnostic-service.test.ts` |
| Test | `src/handlers/__tests__/document-link.handler.test.ts` |
| Test | `src/handlers/__tests__/folding-range.handler.test.ts` |
| Test | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Test | `src/handlers/__tests__/hover.handler.test.ts` |

## Definition of Done

- [ ] gfm behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
