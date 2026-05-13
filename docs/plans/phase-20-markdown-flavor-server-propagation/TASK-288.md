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

Add a server configuration path that accepts `flavorGrenade.markdownFlavor`
from `workspace/didChangeConfiguration`, validates required ids in BC5, and
dispatches valid selector mutations to Config/BC4 while preserving state on
invalid input.

## Work Scope

- Handle `workspace/didChangeConfiguration` carrying
  `flavorGrenade.markdownFlavor`.
- Validate payload shape: `settings.flavorGrenade.markdownFlavor`.
- Store configured selector state through Config/BC4, not in BC5.
- Mutation target is `Workspace.withMarkdownFlavorSelection` /
  `VaultFolder.withMarkdownFlavorSelection`.
- Reject unsupported values such as `asciidoc`.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-003` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-006 - Server Flavor Configuration Validation|MF-U-006]] | Accepts required ids and rejects unknown ids through `workspace/didChangeConfiguration`. |

## Definition of Done

- [ ] All required ids are accepted.
- [ ] Unknown ids leave previous flavor state intact.
- [ ] BC5 does not compute or store `EffectiveMarkdownFlavor`.
- [ ] Unit tests prove validation behavior.
