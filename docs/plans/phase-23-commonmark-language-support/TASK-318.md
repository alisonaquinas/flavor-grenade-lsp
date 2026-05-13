---
id: "TASK-318"
title: "Implement CommonMark parser semantics"
type: task
status: open
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

Deliver parser/profile semantics for the commonmark flavor using [[research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying commonmark behavior through flavor state.
- Record CommonMark signature behavior: standardized CommonMark block and inline behavior without GFM or Obsidian extensions.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-011 - CommonMark Parser And Analysis|MF-U-011]] | Profile and parser behavior for commonmark. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor commonmark. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] commonmark behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
