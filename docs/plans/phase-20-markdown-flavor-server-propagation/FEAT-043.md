---
id: "FEAT-043"
title: "Markdown Flavor Server Propagation"
type: feature
status: draft
priority: high
phase: 20
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-042"]
tags: [tickets/feature, "phase/20", markdown-flavor]
aliases: ["FEAT-043"]
---

# Markdown Flavor Server Propagation

> [!INFO] `FEAT-043` - Feature - Phase 20 - Status: `draft`

## Goal

Thread effective Markdown flavor through server configuration, parsing,
diagnostics, and spawned-server integration tests.

## Scope

- Accept, validate, and store `flavorGrenade.markdownFlavor`.
- Resolve explicit and `auto` modes.
- Refresh open documents after flavor changes.
- Gate initial Original, CommonMark, and Obsidian analysis behavior.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-288]] | Add server configuration handling for markdown flavor | `open` |
| [[TASK-289]] | Resolve effective flavor for explicit and auto modes | `open` |
| [[TASK-290]] | Thread effective flavor through parser and caches | `open` |
| [[TASK-291]] | Gate Obsidian-only analysis by dialect profile | `open` |
| [[TASK-292]] | Add spawned-server flavor propagation tests | `open` |
| [[TASK-293]] | Refresh open document diagnostics after flavor changes | `open` |
| [[CHORE-105]] | Phase 20 implementation trace and matrix sweep | `open` |
| [[CHORE-106]] | Phase 20 verification and closeout sweep | `open` |

## Definition of Done

- [ ] Supported flavor ids apply without server restart.
- [ ] Unsupported ids are rejected without state corruption.
- [ ] Open document diagnostics refresh after flavor changes.
- [ ] Integration tests cover supported and unsupported flavor transitions.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from server propagation gaps.
