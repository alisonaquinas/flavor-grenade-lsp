---
id: "CHORE-095"
title: "Phase W8 content pipeline verification"
type: chore
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-267", "TASK-268", "TASK-269", "TASK-270", "TASK-271", "TASK-272", "TASK-273", "TASK-274", "TASK-275", "TASK-276"]
tags: [tickets/chore, "phase/W8", website, verification]
aliases: ["CHORE-095"]
---

# Phase W8 Content Pipeline Verification

> [!INFO] `CHORE-095` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Run and record the final verification for Phase W8.

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

- [ ] All website gates pass locally.
- [ ] Repository docs lint passes.
- [ ] CI is green before the phase is marked complete.
- [ ] Execution ledger and roadmap are updated only after CI confirmation.
