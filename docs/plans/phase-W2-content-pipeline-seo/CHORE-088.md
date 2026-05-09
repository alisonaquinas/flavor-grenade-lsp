---
id: "CHORE-088"
title: "Phase W2 content pipeline verification sweep"
type: chore
status: in-progress
priority: high
phase: W2
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-217", "TASK-218", "TASK-219"]
tags: [tickets/chore, "phase/W2", website, verification]
aliases: ["CHORE-088"]
---

# Phase W2 Content Pipeline Verification Sweep

> [!INFO] `CHORE-088` · Chore · Phase W2 · Status: `in-progress`

## Description

Run content, link, SEO, typecheck, and build verification for Phase W2 and
update architecture docs if the pipeline shape changes.

## Acceptance Criteria

- [ ] `cd website && npm run typecheck` passes.
- [ ] `cd website && npm test` passes.
- [ ] `cd website && npm run build` passes.
- [ ] Content and metadata tests cover required public routes.
- [ ] `bun run lint:docs` passes.
- [ ] `FEAT-035` acceptance checklist is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/chore-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Chore created for the Phase W2 verification sweep. Status: `open`.

> [!INFO] Started · 2026-05-09
> Began the Phase W2 verification sweep after TASK-217, TASK-218, and TASK-219
> reached `in-review`. Status: `in-progress`.
