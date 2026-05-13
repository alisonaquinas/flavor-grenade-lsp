---
id: "FEAT-044"
title: "Markdown Flavor BDD Verification And Validation"
type: feature
status: draft
priority: high
phase: 21
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043", "FEAT-045"]
tags: [tickets/feature, "phase/21", markdown-flavor, bdd]
aliases: ["FEAT-044"]
---

# Markdown Flavor BDD Verification And Validation

> [!INFO] `FEAT-044` - Feature - Phase 21 - Status: `draft`

## Goal

Make root BDD, verification, and validation evidence execute against effective
Markdown flavor state rather than stale `ofmarkdown` language simulations.

## Scope

- Rewrite BDD extension harness state.
- Implement flavor selection and dialect profile steps.
- Add CI/file-presence verification for flavor test layers.
- Add validation evidence tying profile claims to research.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-294]] | Rewrite BDD harness around effective flavor state | `open` |
| [[TASK-295]] | Implement Markdown flavor selection BDD steps | `open` |
| [[TASK-296]] | Implement dialect profile BDD steps | `open` |
| [[TASK-297]] | Add flavor verification gate checks | `open` |
| [[TASK-298]] | Add flavor validation review evidence | `open` |
| [[CHORE-107]] | Phase 21 BDD traceability sweep | `open` |
| [[CHORE-108]] | Phase 21 verification and closeout sweep | `open` |

## Definition of Done

- [ ] `bun run bdd` executes flavor scenarios.
- [ ] BDD state separates `languageId` from `effectiveFlavor`.
- [ ] Validation traces every displayed flavor to research or `ofm-spec`.
- [ ] Test matrix and test index reflect implemented evidence.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from BDD and validation gaps.
