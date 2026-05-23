---
id: "TASK-296"
title: "Implement dialect profile BDD steps"
type: task
status: done
priority: high
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-294", "FEAT-043"]
tags: [tickets/task, "phase/21", bdd, markdown-flavor]
aliases: ["TASK-296"]
---

# Implement Dialect Profile BDD Steps

## Description

Implement BDD steps that assert Original Markdown, CommonMark, and researched
profile source/signature behavior. Until the product flavor registry exists,
these steps assert planned executable contracts from harness fixtures rather
than real parser/server behavior.

## Work Scope

- Add effective flavor analysis steps.
- Add source trace assertions for every researched profile.
- Add signature behavior assertions using the profile registry.
- Replace harness profile/source/signature constants with the real product
  registry after Phase 19/E15 expose it.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-009`, `GAP-S-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/bdd/features/markdown-flavor-dialects.feature` | MF-E-002 dialect profile behavior. |

## Definition of Done

- [ ] Original Markdown scenarios execute.
- [ ] CommonMark scenarios execute.
- [ ] Research source examples execute for every flavor row.
- [ ] Planned-contract wording is replaced once assertions read the product
      registry and server analysis output.

## Implementation Notes

- Primary files: `docs/bdd/features/markdown-flavor-dialects.feature`,
  `src/test/bdd/step-definitions/extension-harness.steps.ts`, and
  `src/markdown-flavor/markdown-flavor-profile.ts` through its public barrel.
- Temporary constants in the harness must mirror the Phase 19 profile registry:
  flavor labels, research/source slugs, and signature behavior strings.
- Per-surface expectations remain planned executable contracts until Phases
  22-34 replace them with parser/LSP behavior fixtures.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Done - 2026-05-13
> Dialect profile BDD scenarios execute for every researched flavor. The
> harness records source-backed profile signatures and planned LSP surface
> contracts while later dialect phases retain ownership of concrete parser and
> LSP behavior fixtures.
