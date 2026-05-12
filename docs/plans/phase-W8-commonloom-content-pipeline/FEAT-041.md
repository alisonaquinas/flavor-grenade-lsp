---
id: "FEAT-041"
title: "Commonloom Content Pipeline"
type: feature
status: done
priority: high
phase: W8
created: "2026-05-10"
updated: "2026-05-11"
dependencies: ["FEAT-040"]
tags: [tickets/feature, "phase/W8", website, markdown, commonloom]
aliases: ["FEAT-041"]
---

# Commonloom Content Pipeline

> [!INFO] `FEAT-041` · Feature · Phase W8 · Priority: `high` · Status: `done`

## Goal

Build a Markdown-first website content pipeline that authors copy in Markdown,
maps documents to page records through typed page-group manifests, and generates
deterministic TypeScript content modules for the Svelte website.

## Scope

**In scope:**

- External `commonloom` package integration.
- Thin website adapter for route ids, page groups, media roots, and generated
  TypeScript formatting.
- `website/src/content/copy`, `website/src/content/media`, typed manifests, and
  git-ignored generated output.
- CommonMark and GFM formatting support.
- Frontmatter metadata.
- Sanitized inline HTML.
- Image and link validation.
- Migration of existing page and article copy.
- Content generation and stale-output gates in website scripts and CI.

**Out of scope:**

- Maintaining, publishing, or versioning Commonloom package source from this
  repository.
- Runtime Markdown rendering in routes.
- MDsveX component islands.
- Author-facing content management UI.

## Acceptance Criteria

- [x] Authors can create or update website copy by editing Markdown and manifests.
- [x] One typed manifest exists per page group.
- [x] Generated TypeScript is deterministic and ignored by git.
- [x] `content:check` fails on invalid metadata, unresolved copy paths, broken
  local links, unsafe inline HTML, missing images, duplicate ids, or stale output.
- [x] Website pages consume generated TypeScript records without route-level
  knowledge of Markdown parsing.
- [x] The website adapter consumes Commonloom without recreating local
  `website/src/content/pipeline/commonloom` source.
- [x] Existing W7 public routes and content render without intentional loss.
- [x] Website lint, typecheck, tests, build, and docs lint pass.

## Child Tasks

See [[index]] for the complete ticket list.

## Remaining Closeout Tickets

- [[TASK-277]] compiles generated page records from Markdown and manifests
  instead of from old `websitePages` compatibility data.
- [[TASK-278]] switches website renderer-facing facades to consume generated
  TypeScript records.
- [[CHORE-099]] records final merge and CI evidence before W8 is marked
  complete.
- [[CHORE-100]] audits W8 against phase execution Rules 1-5 and Steps A-L.
- [[CHORE-101]] records the required Step M retrospective after final evidence.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Feature created from the W8 Commonloom ADR, architecture specification,
> technical requirements, and technology research.

> [!INFO] Lifecycle normalized · 2026-05-10
> Replaced invalid `planned` status with lifecycle state `draft` before Step
> A-C ticket readiness work.

> [!INFO] Started · 2026-05-10
> TASK-267 moved to `red` with failing Commonloom tooling scaffold tests.
> Status: `in-progress`.

> [!INFO] Ready · 2026-05-10
> Step A-C readiness details are recorded across child tickets: exact file
> paths, API shapes, linked requirements, linked tests, BDD applicability, and
> required sweep chores. Status: `ready`.

> [!INFO] In review · 2026-05-10
> W8 implementation is in PR #63 with green CI. Generated records are emitted
> and validated; existing Svelte page facades remain compatibility inputs until
> the generated-record renderer switch is reviewed. Status: `in-review`.

> [!INFO] Closeout tickets added · 2026-05-10
> Added TASK-277, TASK-278, and CHORE-099 to close the remaining generated
> renderer-input gap before W8 can be marked complete.

> [!SUCCESS] Generated renderer input · 2026-05-10
> TASK-277 and TASK-278 now compile page records directly from Markdown and
> expose them through the stable website content facade. The generated-renderer
> acceptance criterion is satisfied locally; FEAT-041 remains `in-review`
> pending CHORE-099 merge and CI evidence.

> [!INFO] External package update · 2026-05-11
> Commonloom is now published independently as `commonloom`. Future W8
> requirements in this repository are limited to package integration and the
> Flavor Grenade website adapter; local Commonloom source maintenance no longer
> applies.

## Retrospective

> Written after Step L passes. Date: 2026-05-11.

### What went as planned

Markdown copy, typed manifests, generated TypeScript records, and website
renderer facades all converged on the W8 architecture. The website gate passed
locally with `npm run content:generate`, `npm run content:check`,
`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and
`bun run lint:docs`; PR #64 also merged into `develop` with green CI.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| CHORE-100 | Chore | W8 needed an explicit operational compliance audit after tickets were already in review. | +0.5 h |
| CHORE-101 | Chore | Step M was not represented as a dedicated ticket until closeout. | +0.3 h |
| CHORE-099 | Chore | Final closeout originally ran before the retrospective dependency was explicit. | +0.2 h |
| — | Scope change | Commonloom was published independently, so local Commonloom source maintenance was removed from this repository's W8 requirements. | -0.5 h |

### Process observations

The A-M checklist caught useful closeout gaps, but W8 website phases need
dedicated operational chores at planning time, not at the end. Package boundary
changes should trigger a specification sweep before final ticket closure.

### Carry-forward actions

- [ ] Add phase-execution compliance and retrospective chores when opening the
  next website phase.
- [ ] Treat external package publication as a requirements-changing event that
  updates ADRs, requirements, architecture, research, plans, and ticket scopes
  together.

### Rule / template amendments

- [ ] Consider updating the website phase planning template so Step M and the
  phase-execution compliance audit are present before implementation starts.

> [!SUCCESS] Phase closed · 2026-05-11
> All W8 tasks and chores are terminal, PR #64 merged into `develop` with green
> CI, current branch local gates passed, and the W8 retrospective is recorded.
> Status: `done`.
