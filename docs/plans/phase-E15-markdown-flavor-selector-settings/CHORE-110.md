---
id: "CHORE-110"
title: "Phase E15 verification and closeout sweep"
type: chore
status: done
priority: medium
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-299", "TASK-300", "TASK-301", "TASK-302", "TASK-303", "TASK-304"]
tags: [tickets/chore, "phase/E15", verification]
aliases: ["CHORE-110"]
---

# Phase E15 Verification And Closeout Sweep

## Description

Run extension compile/unit/docs checks and prepare E15 for review.

## Work Scope

- Run `npm run compile` and `npm test` from `extension/`.
- Run docs lint for changed documentation.
- Record E15 selector/settings validation evidence in
  `extension/docs/tests/evidence/markdown-flavor-settings-scope.md`, including
  workspace-folder/workspace/user target behavior.
- Link any remaining user-visible validation evidence to Phase E17 when it
  requires an Extension Development Host screenshot or log.
- Classify stale `ofmarkdown` test failures found during E15 verification:
  E15 blocker for controller/client-selector/unit propagation failures, E16
  handoff for activation/contribution/Marketplace tests, and E17 handoff for
  Extension Development Host proof.
- Update feature ticket status and workflow log.

## Definition of Done

- [x] E15 gate commands pass.
- [x] E15 validation evidence paths are linked from the extension test index or
      the Phase E17 validation ticket.
- [x] Residual extension gaps are documented for E16/E17.
- [x] Any stale `ofmarkdown` tests encountered are classified with the owning
      phase and replacement evidence path.
- [x] Phase is ready for review.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Green - 2026-05-13
> E15 local gate passed: `bun run lint:docs`, `npm run compile`, and
> `npm test`. Broader A-M evidence also passed root lint/typecheck, audit, unit,
> integration, and BDD. Host proof remains assigned to Phase E17.
> Status: `green`.
