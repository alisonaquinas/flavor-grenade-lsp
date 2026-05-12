---
id: "TASK-279"
title: "Remove local Commonloom source"
type: task
status: green
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-12"
updated: "2026-05-12"
dependencies: ["TASK-267", "TASK-268", "TASK-269", "TASK-270", "TASK-271", "TASK-278"]
tags: [tickets/task, "phase/W8", website, commonloom, package-boundary]
aliases: ["TASK-279"]
---

# Remove Local Commonloom Source

> [!INFO] `TASK-279` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `green`

## Description

Delete `website/src/content/pipeline/commonloom` and migrate all website
pipeline imports, tests, and package dependencies to the published
`commonloom` npm package.

## Work Scope

- Add the external `commonloom` package to `website/package.json`.
- Replace website adapter imports from `../commonloom` with package imports.
- Remove tests that only prove local Commonloom internals and keep integration
  coverage that proves the website adapter consumes package exports.
- Delete `website/src/content/pipeline/commonloom/**`.
- Remove direct website dependencies that only existed for the local Commonloom
  implementation, unless the website adapter still uses them directly.
- Verify no source or test import resolves through
  `website/src/content/pipeline/commonloom`.

## Implementation Notes

Create or modify:

- `website/package.json`
- `website/package-lock.json`
- `website/src/content/pipeline/website/**`
- `website/tests/content-pipeline-*.test.ts`
- `docs/plans/phase-W8-commonloom-content-pipeline/index.md`

Delete:

- `website/src/content/pipeline/commonloom/**`

## Linked Requirements

- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]
- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-core.test.ts` | Website pipeline imports reusable APIs from `commonloom`. |
| `website/tests/content-pipeline-generated-from-markdown.test.ts` | Generated page output still changes when Markdown copy changes. |
| `website/tests/content-pipeline-renderer-generated.test.ts` | Renderer-facing facades still consume generated page records. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] `website/src/content/pipeline/commonloom` no longer exists.
- [x] `rg "src/content/pipeline/commonloom|../commonloom|pipeline/commonloom" website/src website/tests website/scripts` finds no active local imports.
- [x] Website package dependencies represent `commonloom` as the reusable
  content-pipeline dependency.
- [ ] `npm run content:generate`, `npm run content:check`, `npm run lint`,
  `npm run typecheck`, `npm test`, `npm run build`, and `bun run lint:docs`
  pass.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-12
> User review found the local Commonloom source directory still present after
> W8 was marked complete. Reopening W8 execution to remove local source and
> prove package-boundary compliance.

> [!FAILURE] Red test · 2026-05-12
> Updated Commonloom core coverage to import from the published `commonloom`
> package, require `commonloom` in website package dependencies, and fail while
> `website/src/content/pipeline/commonloom` exists. Status: `red`.

> [!SUCCESS] Green implementation · 2026-05-12
> Installed `commonloom@0.1.0`, replaced website adapter and test imports with
> package imports, removed direct website dependencies that belonged to the
> local Commonloom implementation, and deleted
> `website/src/content/pipeline/commonloom`. Targeted content-pipeline tests
> pass and no local Commonloom import references remain. Status: `green`.
