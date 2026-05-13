---
id: "TASK-317"
title: "Add Original Markdown tests and validation evidence"
type: task
status: open
priority: high
phase: 22
parent: "FEAT-048"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-048"]
tags: [tickets/task, "phase/22", markdown-flavor, "original"]
aliases: ["TASK-317"]
---

# Add Original Markdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the original flavor using [[research/commonmark-and-original-markdown]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying original behavior through flavor state.
- Record Original Markdown signature behavior: historical core Markdown without fenced code, pipe tables, task lists, wiki links, or callouts.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-010 - Original Markdown Parser And Analysis|MF-U-010]] | Profile and parser behavior for original. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor original. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] original behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
