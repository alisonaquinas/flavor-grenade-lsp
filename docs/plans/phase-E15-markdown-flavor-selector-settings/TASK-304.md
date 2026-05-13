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

Send effective flavor changes to the server and trigger refresh for open
Markdown documents.

## Work Scope

- Use initialization options, configuration changes, or a documented metadata
  request.
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

| Test file | Expected coverage |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Propagation call and refresh trigger behavior. |
| `extension/src/markdown-flavor.test.ts` | Parameterized propagation payloads for every required explicit flavor id, plus `auto` resolution and standalone `original`. |
| `extension/src/markdown-flavor.test.ts` | No propagation or reanalysis is sent for `.md` documents whose language id is `plaintext`, `mdx`, or another non-`markdown` value. |

## Definition of Done

- [ ] Flavor changes notify the server.
- [ ] Every required explicit flavor id is covered by propagation tests.
- [ ] Standalone `original` is propagated and reanalyzed correctly.
- [ ] Open Markdown refresh path runs after selector changes.
- [ ] Non-`markdown` documents are excluded from refresh and propagation.
- [ ] Server failure preserves user-visible flavor state.
