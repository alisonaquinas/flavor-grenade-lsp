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
- Validate resource-specific payload shape when present: selected value,
  effective value, source, and resource key.
- Reject oversized maps, nested unexpected objects, dangerous object keys,
  non-`file://` URI keys, unknown resources, stale resources, and `auto` as an
  effective flavor.
- Store configured selector state through Config/BC4, not in BC5.
- Mutation target is `Workspace.withMarkdownFlavorSelection` /
  `VaultFolder.withMarkdownFlavorSelection`.
- Reject unsupported values such as `asciidoc`.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-003` |
| `Security.Input.FlavorPropagationPayload` | `AUD-SEC-003` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-006 - Server Flavor Configuration Validation|MF-U-006]] | Accepts required ids and rejects unknown ids through `workspace/didChangeConfiguration`. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-009 - Flavor Security Input Validation|MF-I-009]] | Rejects malformed propagation payloads and unsafe TOML evidence before state mutation. |

## Definition of Done

- [ ] All required ids are accepted.
- [ ] Unknown ids leave previous flavor state intact.
- [ ] Malformed, oversized, polluted, stale, unknown-resource, and non-file URI
      payloads leave previous flavor state intact.
- [ ] BC5 does not compute or store `EffectiveMarkdownFlavor`.
- [ ] Unit tests prove validation behavior.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
