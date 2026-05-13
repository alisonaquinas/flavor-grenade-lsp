---
id: "TASK-276"
title: "Verify website parity and authoring docs"
type: task
status: done
priority: medium
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-11"
dependencies: ["TASK-274", "TASK-275"]
tags: [tickets/task, "phase/W8", website, docs, verification]
aliases: ["TASK-276"]
---

# Verify Website Parity And Authoring Docs

> [!INFO] `TASK-276` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `done`

## Description

Prove the migrated website renders the same public surface and document the new
authoring workflow.

## Work Scope

- Add or update authoring documentation for Markdown copy, frontmatter, images,
  inline HTML, manifests, generation, and diagnostics.
- Verify page rendering parity for migrated routes.
- Verify generated source traces help authors locate bad Markdown or media.
- Document that Commonloom is consumed from the external npm package and is not
  maintained locally.

## Implementation Notes

Create or modify:

- `website/docs/architecture/content-pipeline.md`
- `website/docs/requirements/technical/source-layout-and-documentation.md`
- `website/docs/authoring/content-pipeline.md`
- `website/tests/content-pipeline-parity.test.ts`
- `website/tests/content-pipeline-migration.test.ts`

Authoring docs must explain:

- adding Markdown copy
- adding or updating frontmatter
- adding images under `website/src/content/media`
- using inline HTML safely
- mapping copy through page-group manifests
- running `npm run content:generate` and `npm run content:check`
- interpreting diagnostics with source traces

Commonloom now lives outside this repository. W8 must not maintain local
Commonloom source under `website/src/content/pipeline/commonloom`; future
Commonloom changes are package updates.

## Linked Requirements

- [[website/docs/architecture/content-pipeline]]
- [[website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-parity.test.ts` | Migrated public routes render with expected metadata and prose. |
| `website/tests/content-pipeline-migration.test.ts` | Authoring docs cover copy, media, manifests, and commands. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Authoring docs explain how to add a page, update copy, add images, use
  inline HTML, and run generation checks.
- [x] Browser or rendered-output checks confirm migrated routes are present.
- [x] Authoring docs identify Commonloom as an external package.
- [x] Local Commonloom maintenance requirements are removed from W8 closeout.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing parity coverage for routed public pages, article hub inventory,
> and the authoring workflow documentation page. Status: `red`.

> [!SUCCESS] Green documentation · 2026-05-10
> Added authoring documentation for Markdown copy, frontmatter, media, inline
> HTML, manifests, commands, source traces, and the Commonloom package
> boundary.
> Verified with `npm test -- --run content-pipeline-parity`. Status: `green`.

> [!INFO] External package update · 2026-05-11
> Replaced extraction follow-up requirements with the current package boundary:
> Commonloom is external, and this repository maintains only integration and
> website adapter docs.

> [!SUCCESS] Closed · 2026-05-11
> PR #64 merged W8 into `develop` with green CI, and the current branch passed
> `npm run content:generate`, `npm run content:check`, `npm run lint`,
> `npm run typecheck`, `npm test`, `npm run build`, and `bun run lint:docs`.
> Status: `done`.
