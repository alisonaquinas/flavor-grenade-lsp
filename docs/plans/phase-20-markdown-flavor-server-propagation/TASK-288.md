---
id: "TASK-288"
title: "Add server configuration handling for markdown flavor"
type: task
status: open
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043", "TASK-283"]
tags: [tickets/task, "phase/20", markdown-flavor]
aliases: ["TASK-288"]
---

# Add Server Configuration Handling For Markdown Flavor

## Description

Add a server configuration path that accepts `flavorGrenade.markdownFlavor`,
validates required ids, and preserves state on invalid input.

## Work Scope

- Handle `workspace/didChangeConfiguration` or a documented equivalent.
- Store configured flavor state in a server service.
- Reject unsupported values such as `asciidoc`.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-003` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/lsp/handlers/__tests__/configuration.handler.test.ts` | Accepts required ids and rejects unknown ids. |

## Definition of Done

- [ ] All required ids are accepted.
- [ ] Unknown ids leave previous flavor state intact.
- [ ] Unit tests prove validation behavior.
