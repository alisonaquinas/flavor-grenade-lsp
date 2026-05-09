---
id: "CHORE-091"
title: "Phase W5 release readiness sweep"
type: chore
status: in-progress
priority: high
phase: W5
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-226", "TASK-227", "TASK-228"]
tags: [tickets/chore, "phase/W5", website, verification]
aliases: ["CHORE-091"]
---

# Phase W5 Release Readiness Sweep

> [!INFO] `CHORE-091` · Chore · Phase W5 · Status: `in-progress`

## Description

Run the final website release readiness pass, update the ledger, and collect
CI and deployment evidence before Phase W5 is marked complete.

## Acceptance Criteria

- [ ] Website CI checks pass on the release PR.
- [ ] Release tag workflow passes.
- [ ] Pages deployment succeeds.
- [ ] Production smoke checks pass.
- [ ] Changelog and release docs are current.
- [ ] `FEAT-038` acceptance checklist is updated.
- [ ] Execution ledger is updated only after CI and deploy evidence are green.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/chore-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Chore created for the Phase W5 release readiness sweep. Status: `open`.

> [!INFO] Started · 2026-05-09
> Started the readiness sweep after TASK-226, TASK-227, and TASK-228 reached
> `in-review`. Status: `in-progress`.

> [!WARNING] Finding · 2026-05-09
> Found BUG-028: the website Pages tag trigger used a regex-shaped pattern
> inside a GitHub Actions glob filter. Opened and triaged the bug before fixing.
