---
id: "TASK-304"
title: "Propagate effective flavor from extension to server"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-302", "TASK-303", "FEAT-043"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-304"]
---

# Propagate Effective Flavor From Extension To Server

## Description

Send effective flavor changes to the server through
`workspace/didChangeConfiguration` carrying `flavorGrenade.markdownFlavor` and
resource-specific selected/effective flavor state, then trigger refresh for
open Markdown documents.

## Work Scope

- Use `workspace/didChangeConfiguration` with `flavorGrenade.markdownFlavor`
  and resource-specific selected/effective flavor state, matching the Phase 20
  server contract.
- Define and test the payload shape for multi-root, standalone, and multiple
  open-document contexts. The payload must include the selected setting value
  (`auto` or explicit flavor), the resolved effective flavor, the source, and a
  resource key such as document URI or workspace folder URI. `auto` must never
  be sent as the effective flavor.
- Enforce payload security before sending: bounded resource map, supported
  `file://` resource keys, no dangerous object keys, no stale/unknown resources,
  and no propagation from restricted, virtual, unsupported-scheme, or untrusted
  contexts.
- Refresh server analysis after selector changes.
- Select every required explicit flavor id and verify the exact server payload
  and effective flavor, including standalone `original`.
- Trigger reanalysis for already-open Markdown documents after effective flavor
  changes.
- Recompute and propagate affected open-document state after selector changes,
  workspace-folder changes, visible editor changes, file opens, server
  readiness or membership changes, `.obsidian/` marker changes,
  `.flavor-grenade.toml` appear/disappear/change events, and settings changes.
- Exclude open documents whose current VS Code language id is not `markdown`
  from flavor propagation and refresh.
- Handle server unavailable state without losing selector state.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-E-006`, `AUD-E-001`, `AUD-ET-003` |
| `Extension.MarkdownFlavor.Refresh` | `GAP-E-007`, `AUD-E-007` |
| `Security.Input.FlavorPropagationPayload` | `AUD-SEC-003`, `AUD-SEC-006` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-009`, `EXT-MF-U-010` | `extension/src/markdown-flavor.test.ts` | Propagation call and refresh trigger behavior. |
| `EXT-MF-U-009` | `extension/src/markdown-flavor.test.ts` | Parameterized `workspace/didChangeConfiguration` payloads for `flavorGrenade.markdownFlavor`, resource key, selected value, source, every required explicit flavor id, `auto` resolution, and standalone `original`. |
| `EXT-MF-U-011` | `extension/src/markdown-flavor.test.ts` | No propagation or reanalysis is sent for `.md` documents whose language id is `plaintext`, `mdx`, or another non-`markdown` value. |
| `EXT-MF-I-004` | `extension/src/commands.test.ts` | Rebuild-index completion and other refresh triggers recompute effective flavor for open Markdown editors without leaking one resource's flavor to another. |
| `EXT-MF-I-008` | `extension/src/markdown-flavor.test.ts` or `extension/src/commands.test.ts` | Client stub records exact resource-specific outbound payload shape for every required explicit flavor. |
| `EXT-MF-I-009` | `extension/src/commands.test.ts` | Server-unavailable, restarting, or not-ready states preserve selector state and replay or recompute effective flavor after readiness. |

## Definition of Done

- [ ] Flavor changes notify the server through `workspace/didChangeConfiguration`
      carrying `flavorGrenade.markdownFlavor` plus resource-specific selected,
      effective, source, and resource-key data.
- [ ] Multi-root and standalone tests prove one document's override does not
      change another document's effective flavor.
- [ ] Payload tests prove oversized maps, unsupported schemes, dangerous keys,
      unknown/stale resources, and restricted/virtual/untrusted contexts do not
      propagate state.
- [ ] Every required explicit flavor id is covered by propagation tests.
- [ ] Standalone `original` is propagated and reanalyzed correctly.
- [ ] Open Markdown refresh path runs after selector, workspace-folder, visible
      editor, file-open, server-readiness, membership, marker,
      `.flavor-grenade.toml` appear/disappear/change, and settings changes.
- [ ] Integration coverage proves outbound payload shape and server-unavailable
      replay/recompute behavior.
- [ ] Non-`markdown` documents are excluded from refresh and propagation.
- [ ] Server failure preserves user-visible flavor state.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added for exact `workspace/didChangeConfiguration` payloads,
> every explicit flavor id, resource-specific state, and propagation suppression
> for restricted or inactive resources.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Extension refresh sends resource-specific `workspace/didChangeConfiguration`
> payloads with selected/effective/source state and suppresses propagation for
> restricted, unsupported-scheme, or non-Markdown resources.
> Status: `green`.
