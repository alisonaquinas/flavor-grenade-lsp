---
id: "TASK-346"
title: "Add R Markdown diagnostics and LSP features"
type: task
status: open
priority: high
phase: 32
parent: "FEAT-058"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-058"]
tags: [tickets/task, "phase/32", markdown-flavor, "r-markdown"]
aliases: ["TASK-346"]
---

# Add R Markdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the r-markdown flavor using [[research/r-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying r-markdown behavior through flavor state.
- Record R Markdown signature behavior: YAML metadata, executable code chunk fences, chunk options, math, and document-output metadata without running code.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]] | Profile and parser behavior for r-markdown. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor r-markdown. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] r-markdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
