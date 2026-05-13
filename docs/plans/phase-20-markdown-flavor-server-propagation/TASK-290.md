---
id: "TASK-290"
title: "Thread effective flavor through parser and caches"
type: task
status: open
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-289"]
tags: [tickets/task, "phase/20", markdown-flavor]
aliases: ["TASK-290"]
---

# Thread Effective Flavor Through Parser And Caches

## Description

Carry BC4-owned `EffectiveMarkdownFlavor` into BC2 parse or analysis context so
downstream services can observe the selected dialect.

## Work Scope

- Add `ParseContext` / flavor metadata to `MarkdownDoc` or companion analysis
  state.
- Update didOpen, didChange, vault scanner, and file watcher parse paths.
- Preserve existing `VaultIndex` single source of truth invariant.
- Generalize implementation terms toward `MarkdownDoc` / `MarkdownIndex` while
  preserving current `OFMDoc` / `OFMIndex` compatibility for Obsidian behavior.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-003`, `GAP-S-007` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/test/integration/markdown-flavor.test.ts` | Open document analysis records effective flavor. |

## Implementation Notes

- Add optional `ParseContext` to `OFMParser.parse(...)`.
- Add `markdownFlavor` and `parseContext` metadata to `OFMDoc`.
- Update didOpen/didChange parse paths to resolve effective flavor through `MarkdownFlavorState`.
- Preserve `ParseCache` and `VaultIndex` as the only parsed document stores.

## Definition of Done

- [ ] Open documents have observable effective flavor.
- [ ] Vault-indexed documents keep flavor metadata consistent.
- [ ] No second document cache is introduced.
- [ ] BC2 consumes effective flavor only from parse context.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.
