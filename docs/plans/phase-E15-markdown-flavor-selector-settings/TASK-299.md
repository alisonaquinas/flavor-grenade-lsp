---
id: "TASK-299"
title: "Add extension flavor constants and setting schema"
type: task
status: open
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

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.RequiredCoverage` | `GAP-E-003` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-001` | `extension/src/markdown-flavor.test.ts` | Flavor constants and schema contain required ids. |
| `EXT-MF-U-013` | `src/parser/__tests__/markdown-flavor-profiles.test.ts` or shared contract fixture | Extension constants, package schema enum, quick-pick ids, and server accepted ids are identical. |

## Definition of Done

- [ ] Package schema includes `flavorGrenade.markdownFlavor`.
- [ ] Constants include all required ids.
- [ ] A contract test guards client/server flavor enum drift.
- [ ] `npm test` covers enum and label order.
