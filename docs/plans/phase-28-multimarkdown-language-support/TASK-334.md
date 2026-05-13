---
id: "TASK-334"
title: "Add MultiMarkdown diagnostics and LSP features"
type: task
status: open
priority: high
phase: 28
parent: "FEAT-054"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-054"]
tags: [tickets/task, "phase/28", markdown-flavor, "multimarkdown"]
aliases: ["TASK-334"]
---

# Add MultiMarkdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the multimarkdown flavor using [[research/multimarkdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying multimarkdown behavior through flavor state.
- Record MultiMarkdown signature behavior: metadata, tables, footnotes, citations, labels, and cross-references.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]] | Profile and parser behavior for multimarkdown. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor multimarkdown. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] multimarkdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
