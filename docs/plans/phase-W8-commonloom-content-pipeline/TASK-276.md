---
id: "TASK-276"
title: "Verify website parity and authoring docs"
type: task
status: red
priority: medium
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-274", "TASK-275"]
tags: [tickets/task, "phase/W8", website, docs, verification]
aliases: ["TASK-276"]
---

# Verify Website Parity And Authoring Docs

> [!INFO] `TASK-276` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `red`

## Description

Prove the migrated website renders the same public surface and document the new
authoring workflow.

## Work Scope

- Add or update authoring documentation for Markdown copy, frontmatter, images,
  inline HTML, manifests, generation, and diagnostics.
- Verify page rendering parity for migrated routes.
- Verify generated source traces help authors locate bad Markdown or media.
- Record known follow-up work for eventual Commonloom extraction.

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

Commonloom extraction remains a follow-up after W8 proves the API. W8 must not
start a separate repository.

## Linked Requirements

- [[../../../website/docs/architecture/content-pipeline]]
- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-parity.test.ts` | Migrated public routes render with expected metadata and prose. |
| `website/tests/content-pipeline-migration.test.ts` | Authoring docs cover copy, media, manifests, and commands. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Authoring docs explain how to add a page, update copy, add images, use
  inline HTML, and run generation checks.
- [ ] Browser or rendered-output checks confirm migrated routes are present.
- [ ] Follow-up extraction criteria are documented without blocking W8.
- [ ] Commonloom extraction criteria are documented without blocking W8 closeout.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing parity coverage for routed public pages, article hub inventory,
> and the authoring workflow documentation page. Status: `red`.
