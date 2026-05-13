---
id: "TASK-331"
title: "Add Pandoc Markdown diagnostics and LSP features"
type: task
status: open
priority: high
phase: 27
parent: "FEAT-053"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-053"]
tags: [tickets/task, "phase/27", markdown-flavor, "pandoc"]
aliases: ["TASK-331"]
---

# Add Pandoc Markdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the pandoc flavor using [[research/pandoc-markdown-deep-research-report]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying pandoc behavior through flavor state.
- Record Pandoc Markdown signature behavior: metadata blocks, citations, math, attributes, extension toggles, and cross-reference-oriented behavior.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-015 - Pandoc Markdown Parser And Analysis|MF-U-015]] | Profile and parser behavior for pandoc. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor pandoc. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] pandoc behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
