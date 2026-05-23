---
id: "CHORE-145"
title: "Shorten MultiMarkdown table parser helper"
type: chore
status: done
priority: medium
phase: 28
parent: "FEAT-054"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-054"]
tags: [tickets/chore, "phase/28", markdown-flavor, "multimarkdown", code-quality]
aliases: ["CHORE-145"]
---

# Shorten MultiMarkdown table parser helper

## Description

Step F code-quality sweep found `MultimarkdownParser.parseTables` at 41 lines,
exceeding the documented function-length limit of 40 lines.

## Work Scope

- Refactor `src/parser/multimarkdown-parser.ts` so `parseTables` is at or below
  40 lines.
- Preserve current MultiMarkdown table detection behavior and targeted test
  coverage.
- Re-run typecheck and targeted MultiMarkdown parser/LSP tests after the change.

## Linked Requirements

| Requirement | Gap |
|---|---|
| Quality.TDD.StrictRedGreen | Step F code-quality sweep |

## Definition of Done

- [x] `parseTables` is at or below 40 lines.
- [x] Targeted MultiMarkdown tests still pass.
- [x] `bun run typecheck` exits 0.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Opened before fixing the Step F function-length finding.

> [!INFO] Done - 2026-05-13
> Status set to `done`. Extracted table-end scanning into a helper, leaving
> `parseTables` at 40 lines. `bun run typecheck` and targeted MultiMarkdown
> tests pass.
