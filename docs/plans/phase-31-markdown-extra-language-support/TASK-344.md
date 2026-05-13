---
id: "TASK-344"
title: "Add Markdown Extra tests and validation evidence"
type: task
status: open
priority: high
phase: 31
parent: "FEAT-057"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-057"]
tags: [tickets/task, "phase/31", markdown-flavor, "markdown-extra"]
aliases: ["TASK-344"]
---

# Add Markdown Extra tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the markdown-extra flavor using [[research/markdown-extra-analysis]] and ADR020 as the controlling specification.

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
| [[test/markdown-flavor-unit-spec]] | Profile and parser behavior for markdown-extra. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor markdown-extra. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] markdown-extra behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
