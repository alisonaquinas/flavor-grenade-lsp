---
id: "FEAT-041"
title: "Commonloom Content Pipeline"
type: feature
status: in-review
priority: high
phase: W8
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["FEAT-040"]
tags: [tickets/feature, "phase/W8", website, markdown, commonloom]
aliases: ["FEAT-041"]
---

# Commonloom Content Pipeline

> [!INFO] `FEAT-041` · Feature · Phase W8 · Priority: `high` · Status: `in-review`

## Goal

Build a Markdown-first website content pipeline that authors copy in Markdown,
maps documents to page records through typed page-group manifests, and generates
deterministic TypeScript content modules for the Svelte website.

## Scope

**In scope:**

- Commonloom internal TypeScript compiler core.
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

- Separate Commonloom repository or package publication.
- Runtime Markdown rendering in routes.
- MDsveX component islands.
- Author-facing content management UI.

## Acceptance Criteria

- [x] Authors can create or update website copy by editing Markdown and manifests.
- [x] One typed manifest exists per page group.
- [x] Generated TypeScript is deterministic and ignored by git.
- [x] `content:check` fails on invalid metadata, unresolved copy paths, broken
  local links, unsafe inline HTML, missing images, duplicate ids, or stale output.
- [ ] Website pages consume generated TypeScript records without route-level
  knowledge of Markdown parsing.
- [x] Commonloom has no direct dependency on Svelte, website route modules, or
  Flavor Grenade product data.
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

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Feature created from the W8 Commonloom ADR, architecture specification,
> technical requirements, and technology research.

> [!INFO] Lifecycle normalized · 2026-05-10
> Replaced invalid `planned` status with lifecycle state `draft` before Step
> A-C ticket readiness work.

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

> [!INFO] Started · 2026-05-10
> TASK-267 moved to `red` with failing Commonloom tooling scaffold tests.
> Status: `in-progress`.
