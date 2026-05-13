---
id: "TASK-299"
title: "Add extension flavor constants and setting schema"
type: task
status: done
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045", "TASK-283"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-299"]
---

# Add Extension Flavor Constants And Setting Schema

## Description

Add extension-side flavor constants and the `flavorGrenade.markdownFlavor`
configuration schema.

## Work Scope

- Define required flavor ids, labels, and quick-pick order.
- Add package configuration enum with default `auto`.
- Unit-test schema and constants against ADR020 and the server flavor contract.
- Add an explicit `DialectProfiles` compatibility trace: extension constants,
  package schema enum, quick-pick ids, and shared profile registry ids must
  match the same supported flavor set.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.RequiredCoverage` | `GAP-E-003` |
| `Extension.MarkdownFlavor.DialectProfiles` | `AUD-E-002`, `AUD-ET-010` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-001` | `extension/src/markdown-flavor.test.ts` | Flavor constants and schema contain required ids. |
| `EXT-MF-U-013` | `src/parser/__tests__/markdown-flavor-profiles.test.ts` or shared contract fixture | Extension constants, package schema enum, quick-pick ids, and server accepted ids are identical. |
| `EXT-MF-U-013` | `src/parser/__tests__/markdown-flavor-profiles.test.ts` or shared contract fixture | Selector/schema ids are compatible with the shared `DialectProfiles` registry; server profile semantics remain server-phase owned. |

## Definition of Done

- [x] Package schema includes `flavorGrenade.markdownFlavor`.
- [x] Constants include all required ids.
- [x] A contract test guards client/server flavor enum drift.
- [x] Contract coverage distinguishes extension selector/profile compatibility
      from server-side dialect semantics.
- [x] `npm test` covers enum and label order.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added for `extension/src/markdown-flavor.test.ts`: selector
> constants, `flavorGrenade.markdownFlavor` package schema, command activation,
> quick-pick labels, and client/server flavor enum compatibility. Expected to
> fail until the extension constants/schema exist.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Extension flavor constants, package schema, selector command activation, and
> quick-pick labels are implemented. `npm test` and `npm run compile` pass from
> `extension/`.
> Status: `green`.
