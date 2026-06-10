---
id: "TASK-292"
title: "Add spawned-server flavor propagation tests"
type: task
status: done
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-288", "TASK-291"]
tags: [tickets/task, "phase/20", markdown-flavor, integration]
aliases: ["TASK-292"]
---

# Add Spawned-Server Flavor Propagation Tests

## Description

Implement `src/test/integration/markdown-flavor.test.ts` for real LSP process
flavor transitions. The process-boundary protocol carries resource-specific
selected/effective flavor state.

## Work Scope

- Spawn server with `.mdfattributes` selecting CommonMark.
- Change `.mdfattributes` to Obsidian with an open document.
- Iterate all required explicit flavor ids.
- Test unsupported flavor rejection.
- Test temp workspace precedence for `.mdfignore`, `.mdfattributes`,
  `flavor=auto`, `!flavor`, invalid configured values, and fallback.
- Assert concrete `.mdfattributes` values bypass Auto Detect, while
  `flavor=auto`, `!flavor`, and absent config invoke Auto Detect.
- Add spawned-server coverage for handler refresh across diagnostics,
  completion, definition, references, document links, hover, semantic tokens,
  folding, and rename after effective-flavor changes.
- Prove resource-specific flavor state across multi-root and standalone
  documents so one document's flavor cannot leak into another.
- Exercise host/conversion boundary classification through the real LSP process
  boundary after effective-flavor refresh.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-008` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-integration-spec#MF-I-005|MF-I-005]] | Spawned-server temp workspace precedence cases: `.mdfignore`, `.mdfattributes`, `flavor=auto`, `!flavor`, invalid values, and fallback. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-006 - Handler Refresh Coverage|MF-I-006]] | Handler-level refresh reaches diagnostics, completion, navigation/document links, hover, semantic tokens, folding, and rename. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-007 - Resource-Specific Propagation|MF-I-007]] | Multi-root and standalone resource keys keep effective flavor document-specific. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-008 - Host Boundary Integration|MF-I-008]] | Host/conversion boundary dispositions survive spawned-server propagation. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-009 - Flavor Security Input Validation|MF-I-009]] | Malformed propagation payloads and unsafe `.mdfignore`/`.mdfattributes` fixtures fail before state mutation. |
| `src/test/integration/markdown-flavor.test.ts` | MF-I-001 through MF-I-009. |

## Implementation Notes

- Create `src/test/integration/markdown-flavor.test.ts`.
- Reuse the spawned stdio LSP client pattern from existing integration tests.
- Cover open document flavor metadata, CommonMark-to-Obsidian change, all explicit ids, invalid id preservation, resource-specific isolation, and boundary classification over JSON-RPC.

## Definition of Done

- [x] Spawned integration tests cover supported ids.
- [x] Invalid id path is tested.
- [x] Temp workspace precedence covers `.mdfignore`, `.mdfattributes`,
      `flavor=auto`, `!flavor`, invalid values, and fallback.
- [x] Concrete `.mdfattributes` values bypass Auto Detect, while Auto Detect
      triggers recompute from marker/membership/syntax evidence.
- [x] Spawned integration tests prove every named LSP handler consumes refreshed
      effective flavor.
- [x] Multi-root and standalone tests prove resource-specific flavor isolation.
- [x] Spawned integration tests prove non-local boundary examples do not become
      local diagnostics, navigation targets, or rename edits.
- [x] Tests run in local root test battery or documented integration gate.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing spawned-server propagation assertions added before debug query endpoints and configuration propagation exist.

> [!SUCCESS] GREEN - 2026-05-13
> Added spawned-server coverage for CommonMark-to-Obsidian refresh, invalid
> selector preservation, `.mdfignore`/`.mdfattributes` evidence, and boundary
> classification.
