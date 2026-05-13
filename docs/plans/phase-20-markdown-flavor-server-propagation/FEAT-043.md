---
id: "FEAT-043"
title: "Markdown Flavor Server Propagation"
type: feature
status: in-progress
priority: high
phase: 20
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-042"]
tags: [tickets/feature, "phase/20", markdown-flavor]
aliases: ["FEAT-043"]
---

# Markdown Flavor Server Propagation

> [!INFO] `FEAT-043` - Feature - Phase 20 - Status: `in-progress`

## Goal

Thread server-owned `EffectiveMarkdownFlavor` through configuration, parsing,
diagnostics, and spawned-server integration tests without weakening input,
config, or boundary security gates.

## Scope

- Accept and validate `flavorGrenade.markdownFlavor` from
  `workspace/didChangeConfiguration` in BC5, then dispatch to BC4/Config.
- Resolve explicit and `auto` modes in BC4 using `MarkdownFlavorCascade`.
- Validate resource-specific flavor payloads before Config/BC4 mutation.
- Confine and validate `.flavor-grenade.toml` project evidence before flavor
  state uses it.
- Refresh open documents after flavor changes.
- Gate initial Original, CommonMark, and Obsidian analysis behavior.

## Evidence Trace

- [[docs/test/markdown-flavor-unit-spec#MF-U-006 - Server Flavor Configuration Validation|MF-U-006]]
  covers server configuration validation.
- [[docs/test/markdown-flavor-unit-spec#MF-U-007 - Flavor Change Refresh|MF-U-007]]
  covers refresh triggers.
- [[docs/test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]]
  covers auto resolution and fallback.
- [[docs/test/markdown-flavor-integration-spec#MF-I-005|MF-I-005]] covers
  spawned-server temp workspace precedence.
- [[docs/test/markdown-flavor-integration-spec#MF-I-006 - Handler Refresh Coverage|MF-I-006]] covers
  handler refresh after effective-flavor changes.
- [[docs/test/markdown-flavor-integration-spec#MF-I-007 - Resource-Specific Propagation|MF-I-007]] covers
  resource-specific flavor propagation.
- [[docs/test/markdown-flavor-integration-spec#MF-I-008 - Host Boundary Integration|MF-I-008]] covers
  host/conversion boundary behavior across the spawned server boundary.
- [[docs/test/markdown-flavor-integration-spec#MF-I-009 - Flavor Security Input Validation|MF-I-009]] covers
  malformed flavor payload and unsafe project-config rejection.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-288]] | Add server configuration handling for markdown flavor | `done` |
| [[TASK-289]] | Resolve effective flavor for explicit and auto modes | `done` |
| [[TASK-290]] | Thread effective flavor through parser and caches | `done` |
| [[TASK-291]] | Gate Obsidian-only analysis by dialect profile | `done` |
| [[TASK-292]] | Add spawned-server flavor propagation tests | `done` |
| [[TASK-293]] | Refresh open document diagnostics after flavor changes | `done` |
| [[TASK-354]] | Add shared non-local boundary classification | `done` |
| [[BUG-043]] | Refresh stale LSP unit harnesses for flavor propagation | `done` |
| [[CHORE-105]] | Phase 20 implementation trace and matrix sweep | `open` |
| [[CHORE-106]] | Phase 20 verification and closeout sweep | `open` |

## Definition of Done

- [x] Supported flavor ids apply without server restart.
- [x] Unsupported ids are rejected without state corruption.
- [x] BC4 owns effective flavor state; BC5 only validates protocol payloads.
- [x] Invalid flavor payloads, dangerous keys, unsupported URI schemes,
      oversized maps, and stale resource keys are rejected before state changes.
- [x] Project TOML evidence is confined, size-limited, schema-validated, and
      redacted in logs.
- [x] Open document diagnostics refresh after flavor changes.
- [x] Integration tests cover supported and unsupported flavor transitions,
      handler refresh, resource-specific state, and host/conversion boundary
      classification.
- [x] Closeout cannot advance until [[TASK-354]] has acceptance evidence.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from server propagation gaps.

> [!INFO] Ready - 2026-05-13
> Step A-C sweep confirmed Phase 19 PR #69 is open with green CI. Implementation will add `src/markdown-flavor/markdown-flavor-state.ts`, `src/markdown-flavor/non-local-boundary-classifier.ts`, `src/lsp/handlers/configuration.handler.ts`, `src/lsp/handlers/__tests__/configuration.handler.test.ts`, and `src/test/integration/markdown-flavor.test.ts`, with parser context updates in `src/parser/ofm-parser.ts`, `src/parser/types.ts`, `src/lsp/handlers/did-open.handler.ts`, `src/lsp/handlers/did-change.handler.ts`, and `src/lsp/lsp.module.ts`.

> [!NOTE] RED - 2026-05-13
> Added failing unit and spawned integration coverage for configuration validation, effective flavor resolution, parser context gating, refresh, and boundary classification before implementation exists.

> [!SUCCESS] GREEN - 2026-05-13
> Implemented server-owned Markdown flavor state, configuration validation,
> project TOML evidence, parser context propagation, Obsidian-only token gates,
> open-document refresh, and shared boundary classification. Focused unit and
> spawned-server integration gates pass locally.
