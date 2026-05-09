---
id: "TASK-216"
title: "Establish source and test layout guards"
type: task
status: open
priority: medium
phase: W1
parent: "FEAT-034"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-214", "TASK-215"]
tags: [tickets/task, "phase/W1", website, documentation]
aliases: ["TASK-216"]
---

# Establish Source And Test Layout Guards

> [!INFO] `TASK-216` · Task · Phase W1 · Parent: [[FEAT-034]] · Status: `open`

## Description

Add lightweight checks or documented verification so website source remains in
`website/src`, website tests remain in `website/tests`, and implementation work
does not drift into `website/docs`.

## Linked Requirements

| Requirement | Source |
|---|---|
| Website source and test layout | [[../../../website/docs/requirements/technical/source-layout-and-documentation]] |

## Definition of Done

- [ ] A test, script, or documented CI-ready check validates source/test layout.
- [ ] The check ignores generated output and fixtures appropriately.
- [ ] `website/docs` remains documentation-only.
- [ ] Architecture docs are updated if the layout changes.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.
