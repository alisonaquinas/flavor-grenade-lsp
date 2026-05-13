---
id: "TASK-323"
title: "Add Obsidian flavor regression and validation evidence"
type: task
status: open
priority: high
phase: 24
parent: "FEAT-050"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-050"]
tags: [tickets/task, "phase/24", markdown-flavor, "obsidian"]
aliases: ["TASK-323"]
---

# Add Obsidian flavor regression and validation evidence

## Description

Deliver unit, integration, BDD, verification, and validation evidence for the obsidian flavor using [[ofm-spec/index]] and ADR020 as the controlling specification.

## Work Scope

- Preserve the default VS Code markdown language mode while applying obsidian behavior through flavor state.
- Record Obsidian signature behavior: wiki links, embeds, block refs, tags, callouts, frontmatter, comments, math, and vault semantics.
- Keep Obsidian-only behavior disabled unless the effective flavor is obsidian or a later requirement explicitly allows it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | GAP-S-002 |
| Extension.MarkdownFlavor.ServerPropagation | GAP-S-003 |

## Linked Tests

| Test spec | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec]] | Profile and parser behavior for obsidian. |
| [[test/markdown-flavor-integration-spec]] | Server analysis observes effective flavor obsidian. |
| [[test/markdown-flavor-e2e-spec]] | BDD scenario proves user-visible flavor behavior. |

## Definition of Done

- [ ] obsidian behavior is implemented behind the flavor model.
- [ ] Tests cover positive and portability/unsupported syntax cases.
- [ ] Required LSP surfaces match [[plans/markdown-flavor-lsp-applicability-matrix]] or record a deferred/not-applicable reason with a follow-up ticket.
- [ ] Trace rows in [[test/matrix]] and [[test/index]] are updated.
