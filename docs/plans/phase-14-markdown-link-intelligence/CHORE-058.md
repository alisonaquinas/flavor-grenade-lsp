---
id: "CHORE-058"
title: "Document and split Phase 14 parser surfaces"
type: chore
status: in-progress
priority: medium
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["CHORE-056"]
tags: [tickets/chore, "phase/14"]
aliases: ["CHORE-058"]
---

# Document and split Phase 14 parser surfaces

> [!INFO] `CHORE-058` · Chore · Phase 14 · Priority: `medium` · Status: `in-progress`

## Description

Add missing JSDoc for exported Phase 14 symbols and split
`MarkdownLinkParser.parse` into smaller private helpers without changing parser
behavior.

---

## Motivation

Discovered during CHORE-056 Step F review. The phase-execution checklist calls
out missing JSDoc on exported symbols and functions larger than 40 lines as code
quality findings.

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Quality.CodeReview.StructuralSweep` | Phase code must address structural quality findings | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/parser/markdown-link-parser.ts`
- `src/resolution/markdown-target-classifier.ts`
- `src/resolution/oracle.ts`
- `src/resolution/ref-graph.ts`
- This ticket file and [[plans/phase-14-markdown-link-intelligence/index]]

**Files created:**

- None

**Files deleted:**

- None

---

## Acceptance Criteria

- [ ] Exported Phase 14 symbols have concise JSDoc.
- [ ] `MarkdownLinkParser.parse` delegates to smaller private helpers.
- [ ] Parser and resolver behavior is unchanged.
- [ ] `bun test src/parser/__tests__/markdown-link-parser.test.ts src/parser/__tests__/ofm-parser.integration.test.ts src/resolution/__tests__/markdown-target-classifier.test.ts src/resolution/__tests__/markdown-link-oracle.test.ts src/resolution/__tests__/ref-graph-markdown-links.test.ts` passes.
- [ ] `bun run lint -- --max-warnings 0` passes.
- [ ] `bun run typecheck` passes.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!INFO] Opened - 2026-05-06
> Code quality cleanup ticket opened from CHORE-056 before fixing Step F
> findings. Status: `open`.

> [!INFO] Started - 2026-05-06
> Parser cleanup started after review findings were ticketed. Status:
> `in-progress`.
