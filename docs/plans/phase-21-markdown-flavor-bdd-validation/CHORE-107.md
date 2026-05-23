---
id: "CHORE-107"
title: "Phase 21 BDD traceability sweep"
type: chore
status: done
priority: medium
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-044"]
tags: [tickets/chore, "phase/21", bdd]
aliases: ["CHORE-107"]
---

# Phase 21 BDD Traceability Sweep

## Description

Keep root BDD traceability accurate during flavor acceptance work.

## Work Scope

- Update BDD step maps if maintained.
- Update [[docs/test/index]] and [[docs/test/matrix]] with implemented flavor scenarios.
- Remove stale notes that say flavor BDD steps are missing once complete.

## Definition of Done

- [ ] BDD feature, step, and matrix references align.
- [ ] Stale `ofmarkdown` BDD assumptions are documented or removed.
- [ ] Phase plan reflects final implemented scope.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Done - 2026-05-13
> Updated `docs/test/index.md`, `docs/test/matrix.md`, and
> `docs/test/markdown-flavor-validation-spec.md` so Phase 21 root BDD,
> verification, and validation evidence are marked implemented while later
> extension-host and dialect-parser work remains explicitly deferred.
