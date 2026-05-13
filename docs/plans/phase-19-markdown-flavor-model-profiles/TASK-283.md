---
id: "TASK-283"
title: "Define canonical Markdown flavor contract"
type: task
status: open
priority: high
phase: 19
parent: "FEAT-042"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-042"]
tags: [tickets/task, "phase/19", markdown-flavor]
aliases: ["TASK-283"]
---

# Define Canonical Markdown Flavor Contract

## Description

Create the shared flavor id contract, required display order, and labels from
ADR020. This contract is consumed by server parser/config code and the
extension; labels and profile metadata are not parser-owned UI state.

## Work Scope

- Add a typed selector model for `auto` plus every explicit flavor id.
- Keep `MarkdownFlavorId` explicit-only; keep `auto` as `MarkdownFlavorSelection`.
- Export labels and display order from a shared flavor/config contract for reuse by server tests and client contracts.
- Ensure no unresearched flavor id is accepted.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.RequiredCoverage` | `GAP-S-001` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | Required id list and labels match ADR020. |

## Definition of Done

- [ ] Flavor ids match ADR020 exactly.
- [ ] `auto` is represented separately from explicit profiles.
- [ ] Labels/order are available without importing parser internals.
- [ ] Unit test fails when a required id is removed.
