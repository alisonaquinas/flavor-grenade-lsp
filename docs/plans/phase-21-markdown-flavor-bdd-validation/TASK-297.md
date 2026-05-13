---
id: "TASK-297"
title: "Add flavor verification gate checks"
type: task
status: red
priority: medium
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-295", "TASK-296"]
tags: [tickets/task, "phase/21", verification]
aliases: ["TASK-297"]
---

# Add Flavor Verification Gate Checks

## Description

Ensure CI/local verification checks fail when flavor BDD or flavor test layers
are removed.

## Work Scope

- Update `src/test/ci-workflow.test.ts` or equivalent checks.
- Verify Cucumber config includes exact feature files
  `docs/bdd/features/ofmarkdown-language-mode.feature` and
  `docs/bdd/features/markdown-flavor-dialects.feature`.
- Verify executable feature tags do not imply skipped/non-executed work unless
  Cucumber is actually configured to skip them.
- Add file-presence checks for root flavor specs:
  `docs/test/markdown-flavor-unit-spec.md`,
  `docs/test/markdown-flavor-integration-spec.md`,
  `docs/test/markdown-flavor-e2e-spec.md`,
  `docs/test/markdown-flavor-verification-spec.md`, and
  `docs/test/markdown-flavor-validation-spec.md`.
- Cross-link extension host flavor suite protection through Phase E17/TASK-311
  so `GAP-S-010` covers root unit, integration, BDD, and extension host
  coverage without duplicating host implementation in Phase 21.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `CICD.Workflow.BDDGate` | `GAP-S-010` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/test/ci-workflow.test.ts` | Flavor test gates are wired into CI. |

## Definition of Done

- [ ] CI verification checks include exact flavor feature files.
- [ ] No executed feature keeps a misleading `@wip` tag.
- [ ] Local checks fail on missing flavor test wiring.
- [ ] Phase E17/TASK-311 is linked as the extension host gate for `GAP-S-010`.
- [ ] Verification spec rows are updated.

## Implementation Notes

- Primary files: `src/test/ci-workflow.test.ts`,
  `docs/test/markdown-flavor-verification-spec.md`, `docs/test/index.md`, and
  `docs/test/matrix.md`.
- Guard exact feature paths, root flavor specs, extension flavor specs, and
  Phase 21 validation artifacts under `docs/test/evidence/`.
- RED check: add a guard that fails while
  `docs/test/evidence/markdown-flavor-product-review.md` and
  `docs/test/evidence/markdown-flavor-validation-run.md` are missing.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] RED - 2026-05-13
> Added `src/test/ci-workflow.test.ts` guards for Phase 21 validation artifact
> paths. The guard fails until `markdown-flavor-product-review.md` and
> `markdown-flavor-validation-run.md` exist under `docs/test/evidence/`.
