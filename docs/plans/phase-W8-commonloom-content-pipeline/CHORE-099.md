---
id: "CHORE-099"
title: "Phase W8 final closeout"
type: chore
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-277", "TASK-278", "CHORE-095"]
tags: [tickets/chore, "phase/W8", website, closeout]
aliases: ["CHORE-099"]
---

# Phase W8 Final Closeout

> [!INFO] `CHORE-099` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Close Phase W8 only after generated records are the renderer input and the PR is
merged with green CI evidence.

## Scope of Change

- Re-run final local website gates.
- Confirm PR CI is green after the renderer switch.
- Confirm PR merge into `develop`.
- Update FEAT-041 acceptance criteria.
- Update W8 phase status, roadmap, and execution ledger.
- Keep actual release publishing out of scope.

## Gate Commands

```bash
cd website
npm run content:generate
npm run content:check
npm run lint
npm run typecheck
npm test
npm run build
```

```bash
bun run lint:docs
```

## Definition of Done

- [ ] FEAT-041 has no unchecked acceptance criteria.
- [ ] W8 phase status is `complete` only after merge evidence exists.
- [ ] Execution ledger and roadmap cite the final PR and CI evidence.
- [ ] No generated files under `website/src/content/generated/` are committed.
- [ ] No actual release tag or release publication is pushed.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket added for the remaining W8 closeout sequence after PR #63 exposed the
> generated-renderer switch as a follow-up needed before marking the phase
> complete.
