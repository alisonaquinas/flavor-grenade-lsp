---
id: "TASK-283"
title: "Define canonical Markdown flavor contract"
type: task
status: in-review
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
| `src/parser/__tests__/markdown-flavor-profiles.test.ts` | ✅ Passing coverage for ADR020 id list, labels, selector order, and explicit-only type guard. |

## Implementation Notes

- Create `src/markdown-flavor/markdown-flavor-contract.ts`.
- Export `MARKDOWN_FLAVOR_IDS`, `MARKDOWN_FLAVOR_SELECTIONS`, `MarkdownFlavorId`, `MarkdownFlavorSelection`, `MARKDOWN_FLAVOR_LABELS`, and `isMarkdownFlavorId(value: unknown): value is MarkdownFlavorId`.
- Keep `MarkdownFlavorId` explicit-only and `MarkdownFlavorSelection` as `auto | MarkdownFlavorId`.
- Re-export the contract from `src/markdown-flavor/index.ts`.
- Write the RED assertions in `src/parser/__tests__/markdown-flavor-profiles.test.ts` before implementation.
- ADR020 requires exact id order, exact labels, and no profile entry for `auto`.

## Definition of Done

- [x] Flavor ids match ADR020 exactly.
- [x] `auto` is represented separately from explicit profiles.
- [x] Labels/order are available without importing parser internals.
- [x] Unit test fails when a required id is removed.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing assertions added before `src/markdown-flavor/markdown-flavor-contract.ts` exists.

> [!NOTE] GREEN - 2026-05-13
> Implemented the shared flavor contract in `src/markdown-flavor/markdown-flavor-contract.ts`; focused profile test passes.

> [!INFO] In Review - 2026-05-13
> Lint, typecheck, unit, integration, BDD, docs lint, format, and build gates passed locally; awaiting PR CI.
