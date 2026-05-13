---
id: "FEAT-044"
title: "Markdown Flavor BDD Verification And Validation"
type: feature
status: in-progress
priority: high
phase: 21
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/21", markdown-flavor, bdd]
aliases: ["FEAT-044"]
---

# Markdown Flavor BDD Verification And Validation

> [!INFO] `FEAT-044` - Feature - Phase 21 - Status: `in-progress`

## Goal

Make root BDD, verification, and validation evidence execute against effective
Markdown flavor state rather than stale `ofmarkdown` language simulations.

## Scope

- Rewrite BDD extension harness state.
- Implement flavor selection and dialect profile steps.
- Treat hard-coded harness flavor lists as planned executable contracts only.
- Require replacement with the product registry, extension setting schema, and
  server configuration analysis after Phase 19/E15 deliver those surfaces.
- Add CI/file-presence verification for flavor test layers.
- Add validation evidence tying profile claims to research.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-294]] | Rewrite BDD harness around effective flavor state | `done` |
| [[TASK-295]] | Implement Markdown flavor selection BDD steps | `done` |
| [[TASK-296]] | Implement dialect profile BDD steps | `done` |
| [[TASK-297]] | Add flavor verification gate checks | `done` |
| [[TASK-298]] | Add flavor validation review evidence | `done` |
| [[CHORE-107]] | Phase 21 BDD traceability sweep | `done` |
| [[CHORE-108]] | Phase 21 verification and closeout sweep | `open` |

## Definition of Done

- [ ] `bun run bdd` executes flavor scenarios.
- [ ] BDD state separates `languageId` from `effectiveFlavor`.
- [ ] BDD propagation assertions inspect recorded
      `workspace/didChangeConfiguration` payloads, not only local recomputation.
- [ ] Temporary harness constants are traced to follow-up work that replaces
      them with the product registry, extension schema, and server analysis.
- [ ] Validation traces every displayed flavor to research or `ofm-spec`.
- [ ] Test matrix and test index reflect implemented evidence.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Created from BDD and validation gaps.

> [!INFO] Step A-C - 2026-05-13
> Phase 20 PR #70 is open with green CI. Step A confirmed the Phase 21 plan
> and ticket index; Step B confirmed the linked BDD feature files, root flavor
> test specs, and existing BDD harness are present; Step C scoped work to
> `src/test/bdd/step-definitions/extension-harness.steps.ts`,
> `src/test/ci-workflow.test.ts`, `docs/test/index.md`,
> `docs/test/matrix.md`, `docs/test/markdown-flavor-verification-spec.md`,
> `docs/test/markdown-flavor-validation-spec.md`, and Phase 21 validation
> artifacts under `docs/test/evidence/`.
