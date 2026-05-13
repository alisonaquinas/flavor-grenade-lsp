---
id: "TASK-353"
title: "Add Stack Overflow Markdown tests and validation evidence"
type: task
status: open
priority: high
phase: 34
parent: "FEAT-060"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-060"]
tags: [tickets/task, "phase/34", markdown-flavor, "stack-overflow"]
aliases: ["TASK-353"]
---

# Add Stack Overflow Markdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the stack-overflow flavor using [[research/stack-overflow-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying stack-overflow behavior through flavor state.
- Record Stack Overflow Markdown signature behavior: technical-writing Markdown, code fence behavior, tags, spoilers, tables, and Stack Overflow portability diagnostics.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec]] | Profile and parser behavior for stack-overflow. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor stack-overflow. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] stack-overflow behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
