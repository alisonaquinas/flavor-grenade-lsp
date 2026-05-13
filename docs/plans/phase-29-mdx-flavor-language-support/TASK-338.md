---
id: "TASK-338"
title: "Add MDX tests and validation evidence"
type: task
status: open
priority: high
phase: 29
parent: "FEAT-055"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-055"]
tags: [tickets/task, "phase/29", markdown-flavor, "mdx"]
aliases: ["TASK-338"]
---

# Add MDX tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the mdx flavor using [[research/mdx-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying mdx behavior through flavor state.
- Record MDX signature behavior: JSX elements, expressions, imports, exports, and Markdown interop without taking over the MDX language mode.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec]] | Profile and parser behavior for mdx. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor mdx. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] mdx behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
