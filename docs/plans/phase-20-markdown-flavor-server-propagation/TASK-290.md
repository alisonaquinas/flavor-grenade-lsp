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

## Definition of Done

- [ ] Open documents have observable effective flavor.
- [ ] Vault-indexed documents keep flavor metadata consistent.
- [ ] No second document cache is introduced.
- [ ] BC2 consumes effective flavor only from parse context.
