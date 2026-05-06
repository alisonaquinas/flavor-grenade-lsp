---
id: "CHORE-058"
title: "Document and split Phase 14 parser surfaces"
type: chore
status: in-review
priority: medium
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["CHORE-056"]
tags: [tickets/chore, "phase/14"]
aliases: ["CHORE-058"]
---

# Document and split Phase 14 parser surfaces

> [!INFO] `CHORE-058` · Chore · Phase 14 · Priority: `medium` · Status: `in-review`

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
| `Quality.Docs.Docstrings` | Exported symbols must carry JSDoc | [[requirements/code-quality]] |
| `Quality.SOLID.SingleResponsibility` | Large mixed-responsibility functions must be split | [[requirements/code-quality]] |

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

> [!INFO] Review Ready - 2026-05-06
> Split inline Markdown link parsing into smaller helpers. Targeted parser and
> resolution tests, `bun run typecheck`, and `bun run lint -- --max-warnings 0`
> pass. Status: `in-review`.
