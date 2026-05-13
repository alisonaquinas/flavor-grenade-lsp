---
id: "TASK-340"
title: "Add kramdown diagnostics and LSP features"
type: task
status: open
priority: high
phase: 30
parent: "FEAT-056"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-056"]
tags: [tickets/task, "phase/30", markdown-flavor, "kramdown"]
aliases: ["TASK-340"]
---

# Add kramdown diagnostics and LSP features

## Description

Deliver diagnostics and LSP feature behavior for the kramdown flavor using [[research/kramdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying kramdown behavior through flavor state.
- Record kramdown signature behavior: block and span attributes, definition lists, footnotes, tables, math, and inline attribute lists.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec]] | Profile and parser behavior for kramdown. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor kramdown. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] kramdown behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
