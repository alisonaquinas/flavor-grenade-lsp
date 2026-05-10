---
id: "FEAT-041"
title: "Commonloom Content Pipeline"
type: feature
status: in-progress
priority: high
phase: W8
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["FEAT-040"]
tags: [tickets/feature, "phase/W8", website, markdown, commonloom]
aliases: ["FEAT-041"]
---

# Commonloom Content Pipeline

> [!INFO] `FEAT-041` · Feature · Phase W8 · Priority: `high` · Status: `in-progress`

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

- [ ] Authors can create or update website copy by editing Markdown and manifests.
- [ ] One typed manifest exists per page group.
- [ ] Generated TypeScript is deterministic and ignored by git.
- [ ] `content:check` fails on invalid metadata, unresolved copy paths, broken
  local links, unsafe inline HTML, missing images, duplicate ids, or stale output.
- [ ] Website pages consume generated TypeScript records without route-level
  knowledge of Markdown parsing.
- [ ] Commonloom has no direct dependency on Svelte, website route modules, or
  Flavor Grenade product data.
- [ ] Existing W7 public routes and content render without intentional loss.
- [ ] Website lint, typecheck, tests, build, and docs lint pass.

## Child Tasks

See [[index]] for the complete ticket list.

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

> [!INFO] Started · 2026-05-10
> TASK-267 moved to `red` with failing Commonloom tooling scaffold tests.
> Status: `in-progress`.
