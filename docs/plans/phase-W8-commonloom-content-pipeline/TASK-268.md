---
id: "TASK-268"
title: "Define Commonloom core contracts"
type: task
status: done
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-11"
dependencies: ["TASK-267"]
tags: [tickets/task, "phase/W8", website, commonloom, types]
aliases: ["TASK-268"]
---

# Define Commonloom Core Contracts

> [!INFO] `TASK-268` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `done`

## Description

Consume the reusable data contracts exported by `commonloom` and keep Flavor
Grenade-specific contracts in the website adapter.

## Work Scope

- Import compiler input, output, diagnostic, link, image, and source-trace
  contracts from `commonloom`.
- Define only Flavor Grenade manifest and generated-record adapter types
  locally.
- Keep route ids and page-group enums in the website adapter, not in Commonloom.

## Implementation Notes

Create or modify:

- `website/src/content/pipeline/website/**`
- `website/tests/content-pipeline-core.test.ts`

Commonloom core API shapes are package-owned. Local code should depend on the
published exports rather than redefining them under
`website/src/content/pipeline/commonloom`.

## Linked Requirements

- [[website/docs/architecture/content-pipeline]]
- [[website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-core.test.ts` | Website adapter compiles against package-owned Commonloom contracts. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Contract tests prove the website adapter passes only adapter-supplied data
  into Commonloom.
- [x] Type names and fields match the ADR and architecture terminology.
- [x] Diagnostics carry enough source information for actionable author errors.
- [x] Local adapter contracts do not recreate package-owned Commonloom types.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for stable diagnostic codes, severities, and
> `CommonloomSourceTrace`. Status: `red`.

> [!SUCCESS] Green · 2026-05-10
> Added Commonloom diagnostic constants and normalized source trace, heading,
> link, and image reference contracts. Targeted tests pass. Status: `green`.

> [!INFO] In review · 2026-05-10
> `npm test -- --run content-pipeline`, `npm run lint`, and `npm run
> typecheck` pass from `website/`. Status: `in-review`.

> [!WARNING] Review feedback · 2026-05-10
> Subagent review found route-specific link kinds and incomplete compiler
> configuration contracts. Moved back to `green` while the contract boundary is
> tightened.

> [!SUCCESS] Review fix · 2026-05-10
> Added route-agnostic link kinds, adapter-owned link policy callbacks, output
> mode contracts, manifest entry contracts, and explicit HTML policy contracts.
> Verified with `npm test -- --run content-pipeline`, `npm run lint`, and
> `npm run typecheck`. Status: `green`.

> [!INFO] External package update · 2026-05-11
> Package-owned Commonloom contracts are no longer maintained in this
> repository. Future work should import them from `commonloom` and keep only
> website adapter contracts local.

> [!SUCCESS] Closed · 2026-05-11
> PR #64 merged W8 into `develop` with green CI, and the current branch passed
> `npm run content:generate`, `npm run content:check`, `npm run lint`,
> `npm run typecheck`, `npm test`, `npm run build`, and `bun run lint:docs`.
> Status: `done`.
