---
id: "TASK-333"
title: "Implement MultiMarkdown parser semantics"
type: task
status: open
priority: high
phase: 28
parent: "FEAT-054"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-054"]
tags: [tickets/task, "phase/28", markdown-flavor, "multimarkdown"]
aliases: ["TASK-333"]
---

# Implement MultiMarkdown parser semantics

## Description

Deliver parser/profile semantics for the multimarkdown flavor using [[docs/research/multimarkdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying multimarkdown behavior through flavor state.
- Record MultiMarkdown signature behavior: metadata, tables, footnotes, citations, labels, and cross-references.
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
| [[docs/test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]] | Profile and parser behavior for multimarkdown. |
| [[docs/test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor multimarkdown. |
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

- [ ] multimarkdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Tests include negative cross-flavor parser fixtures proving inactive constructs stay inert for multimarkdown.
- [ ] Required LSP surfaces match [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[docs/test/matrix]] and [[docs/test/index]] are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
