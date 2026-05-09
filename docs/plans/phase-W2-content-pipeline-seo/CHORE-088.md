---
id: "CHORE-088"
title: "Phase W2 content pipeline verification sweep"
type: chore
status: in-review
priority: high
phase: W2
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-217", "TASK-218", "TASK-219"]
tags: [tickets/chore, "phase/W2", website, verification]
aliases: ["CHORE-088"]
---

# Phase W2 Content Pipeline Verification Sweep

> [!INFO] `CHORE-088` · Chore · Phase W2 · Status: `in-review`

## Description

Run content, link, SEO, typecheck, and build verification for Phase W2 and
update architecture docs if the pipeline shape changes.

## Acceptance Criteria

- [x] `cd website && npm run typecheck` passes.
- [x] `cd website && npm test` passes.
- [x] `cd website && npm run build` passes.
- [x] Content and metadata tests cover required public routes.
- [x] `bun run lint:docs` passes.
- [x] `FEAT-035` acceptance checklist is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/chore-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Chore created for the Phase W2 verification sweep. Status: `open`.

> [!INFO] Started · 2026-05-09
> Began the Phase W2 verification sweep after TASK-217, TASK-218, and TASK-219
> reached `in-review`. Status: `in-progress`.

> [!SUCCESS] Local gates passed · 2026-05-09
> Verified `npm run lint`, `npm run typecheck`, `npm test`, and
> `npm run build` from `website/`; `bun run lint:docs`; `git diff --check`;
> root `bun run lint --max-warnings 0`, `bun run typecheck`, `bun test src/`,
> `bun audit`; website and extension `npm audit`; and `bun run bdd --tags
> "@smoke"`. No Step E-L findings required follow-up tickets. Status:
> `in-review`.
