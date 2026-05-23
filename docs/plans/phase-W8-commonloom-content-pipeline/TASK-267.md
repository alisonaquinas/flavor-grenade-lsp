---
id: "TASK-267"
title: "Add Commonloom tooling scaffold"
type: task
status: done
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-11"
dependencies: ["FEAT-041"]
tags: [tickets/task, "phase/W8", website, tooling]
aliases: ["TASK-267"]
---

# Add Commonloom Tooling Scaffold

> [!INFO] `TASK-267` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `done`

## Description

Add the content command scaffold and wire it to the external `commonloom`
package without wiring page rendering yet.

## Work Scope

- Add the external `commonloom` package dependency.
- Add initial command entry points for `content:generate` and `content:check`.
- Keep the website adapter isolated from Svelte route rendering while delegating
  generic Markdown compilation to `commonloom`.

## Implementation Notes

Create or modify:

- `website/scripts/content/generate.ts`
- `website/scripts/content/check.ts`
- `website/src/content/pipeline/website/**`

Modify:

- `website/package.json`
- `website/package-lock.json`

Package integration:

```ts
import { compileCommonloom } from "commonloom";
```

The scaffold commands must exit `0` when no manifests are configured and print
a clear informational message. Later tasks will replace the stub result with
real manifest input.

## Linked Requirements

- [[website/docs/requirements/technical/source-layout-and-documentation]]
- [[website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-scripts.test.ts` | `content:generate` and `content:check` scripts exist in `website/package.json`. |
| `website/tests/content-pipeline-core.test.ts` | Website pipeline imports reusable APIs from `commonloom`. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Website package scripts include `content:generate` and `content:check`.
- [x] The website pipeline compiles against the external `commonloom` package.
- [x] The scaffold can run and report "no manifests found" or equivalent
  non-destructive diagnostics.
- [x] No generated files are committed.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage for `content:generate`, `content:check`, and the
> Commonloom compiler scaffold. Status: `red`.

> [!SUCCESS] Green · 2026-05-10
> Added Commonloom scaffold modules, content command entry points, package
> scripts, and documented W8 dependency choices. Targeted tests pass. Status:
> `green`.

> [!NOTE] Refactor · 2026-05-10
> Lint found an unused scaffold config parameter. Cleaned the stub without
> changing behavior. Status: `refactor`.

> [!INFO] In review · 2026-05-10
> `npm test -- --run content-pipeline tooling`, `npm run lint`, and
> `npm run typecheck` pass from `website/`. Status: `in-review`.

> [!SUCCESS] Review evidence · 2026-05-10
> Definition of Done checked against committed script scaffold and
> non-destructive `NO_MANIFESTS` coverage. Status remains `in-review`.

> [!INFO] External package update · 2026-05-11
> Local Commonloom scaffold requirements are superseded by the independently
> published `commonloom` package. This task now describes command and adapter
> integration only.

> [!SUCCESS] Closed · 2026-05-11
> PR #64 merged W8 into `develop` with green CI, and the current branch passed
> `npm run content:generate`, `npm run content:check`, `npm run lint`,
> `npm run typecheck`, `npm test`, `npm run build`, and `bun run lint:docs`.
> Status: `done`.
