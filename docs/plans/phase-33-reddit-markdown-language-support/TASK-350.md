---
id: "TASK-350"
title: "Add Reddit Markdown tests and validation evidence"
type: task
status: open
priority: high
phase: 33
parent: "FEAT-059"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-059"]
tags: [tickets/task, "phase/33", markdown-flavor, "reddit"]
aliases: ["TASK-350"]
---

# Add Reddit Markdown tests and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the reddit flavor using [[research/reddit-markdown-analysis]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying reddit behavior through flavor state.
- Record Reddit Markdown signature behavior: Reddit platform syntax, spoilers, superscript conventions, subreddit/user links, and portability diagnostics.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]] | Profile and parser behavior for reddit. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor reddit. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] reddit behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
