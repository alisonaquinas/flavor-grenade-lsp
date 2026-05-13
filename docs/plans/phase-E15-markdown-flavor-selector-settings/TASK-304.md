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
the resolved effective flavor, then trigger refresh for open Markdown
documents.

## Work Scope

- Use `workspace/didChangeConfiguration` with `flavorGrenade.markdownFlavor`
  and the resolved effective flavor, matching the Phase 20 server contract.
- Refresh server analysis after selector changes.
- Select every required explicit flavor id and verify the exact server payload
  and effective flavor, including standalone `original`.
- Trigger reanalysis for already-open Markdown documents after effective flavor
  changes.
- Exclude open documents whose current VS Code language id is not `markdown`
  from flavor propagation and refresh.
- Handle server unavailable state without losing selector state.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-E-006` |
| `Extension.MarkdownFlavor.Refresh` | `GAP-E-007` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-009`, `EXT-MF-U-010` | `extension/src/markdown-flavor.test.ts` | Propagation call and refresh trigger behavior. |
| `EXT-MF-U-009` | `extension/src/markdown-flavor.test.ts` | Parameterized `workspace/didChangeConfiguration` payloads for `flavorGrenade.markdownFlavor`, every required explicit flavor id, `auto` resolution, and standalone `original`. |
| `EXT-MF-U-011` | `extension/src/markdown-flavor.test.ts` | No propagation or reanalysis is sent for `.md` documents whose language id is `plaintext`, `mdx`, or another non-`markdown` value. |
| `EXT-MF-I-004` | `extension/src/commands.test.ts` | Rebuild-index completion after selector override recomputes effective flavor for open Markdown editors. |

## Definition of Done

- [ ] Flavor changes notify the server through `workspace/didChangeConfiguration`
      carrying `flavorGrenade.markdownFlavor` and the resolved effective flavor.
- [ ] Every required explicit flavor id is covered by propagation tests.
- [ ] Standalone `original` is propagated and reanalyzed correctly.
- [ ] Open Markdown refresh path runs after selector changes.
- [ ] Non-`markdown` documents are excluded from refresh and propagation.
- [ ] Server failure preserves user-visible flavor state.
