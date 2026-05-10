---
title: "Phase W8: Commonloom Content Pipeline"
phase: W8
status: planned
tags: [plans, website, markdown, content-pipeline, commonloom]
aliases: [Phase W8, Commonloom Content Pipeline, Website Markdown Pipeline]
updated: 2026-05-10
---

# Phase W8: Commonloom Content Pipeline

| Field | Value |
|---|---|
| Phase | W8 |
| Title | Commonloom Content Pipeline |
| Status | planned |
| Gate | Markdown copy, typed manifests, reusable Commonloom compiler, generated TypeScript records, migration, and website build gates pass |
| Depends on | Phase W7 |

## Objective

Move website copy authoring out of hand-maintained TypeScript content modules
and into Markdown documents with typed page-group manifests. The build should
generate deterministic TypeScript records that the existing Svelte pages consume
without committing generated files.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]] | Implement the accepted Commonloom, typed-manifest, generated-TypeScript decision |
| [[../website/docs/architecture/content-pipeline]] | Match the source, manifest, media, compiler, adapter, and generated output boundaries |
| [[../website/docs/requirements/technical/source-layout-and-documentation]] | Add the documented content directories, generated output policy, and authoring affordances |
| [[../website/docs/research/w8-content-pipeline-technology-research]] | Use the researched unified/remark/rehype/zod approach and avoid MDsveX/MDSX as the primary pipeline |

## Scope

### In Scope

- `website/src/content/copy/**/*.md` as the author-owned Markdown copy tree.
- `website/src/content/media/**` as the author-owned image and attachment tree.
- One typed `*.manifest.ts` file per page group.
- Git-ignored `website/src/content/generated/*.generated.ts` renderer inputs.
- A reusable Commonloom core module with no imports from Svelte, routes, or
  Flavor Grenade product data.
- A thin website adapter that owns route ids, page groups, media roots,
  wiki-link policy, and generated file formatting.
- Full CommonMark plus GFM authoring support, including headings, emphasis,
  strong text, blockquotes, lists, tables, code fences, links, images, and inline
  HTML through the approved allowlist.
- Frontmatter parsing and validation for metadata that belongs to individual
  Markdown documents.
- Image path validation, source tracing, diagnostics, and content hash output.
- Migration of existing W7 public copy into Markdown files without route or
  sitemap regressions.

### Out of Scope

- Extracting Commonloom into a separate repository or npm package.
- Runtime Markdown rendering in Svelte routes.
- MDsveX component embedding as the primary authoring model.
- Unbounded raw HTML passthrough.
- Content management UI.

## Architecture

Commonloom is an internal TypeScript library during W8. It accepts project
configuration, manifests, Markdown files, and media roots, then returns validated
content records plus diagnostics. The website adapter translates those records
into generated TypeScript modules that preserve the existing page contracts.

The pipeline is intentionally data-oriented:

1. Authors edit Markdown under `website/src/content/copy`.
2. Authors map documents to page records in page-group manifests.
3. `npm run content:generate` parses, validates, sanitizes, and writes generated
   TypeScript.
4. Website tests, typecheck, and build import only the generated TypeScript
   records.
5. `npm run content:check` verifies the generated output is current and no
   diagnostics are present.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Core | Commonloom parser, validation contracts, diagnostics, source tracing, and media/link analysis |
| Adapter | Website-specific route ids, manifest schema, generated TypeScript emitter, and command scripts |
| Authoring | Markdown copy tree, frontmatter metadata, image affordances, and inline HTML policy |
| Migration | Existing public page and article copy moved into Markdown with parity tests |
| Verification | Content generation, stale-output checks, website tests, docs lint, and build gates |

## Acceptance

- `website/src/content/generated/` is ignored by git and can be recreated from
  source copy and manifests.
- Every page group has exactly one typed manifest.
- Generated TypeScript is the canonical renderer input; generated JSON is
  optional diagnostics or audit output only.
- Markdown supports full CommonMark and GFM formatting expected by public docs.
- Inline HTML is accepted only through the documented sanitized allowlist.
- Local images resolve through the content media policy and surface actionable
  diagnostics when missing, unsafe, or unused.
- Broken links, invalid route ids, invalid frontmatter, duplicate content ids,
  and stale generated output fail `content:check`.
- Existing W7 routes, sitemap entries, metadata, and public copy render with no
  intentional content loss.

## Gate Verification

```bash
cd website
npm run content:generate
npm run content:check
npm run lint
npm run typecheck
npm test
npm run build
```

```bash
bun run lint:docs
```

## Tickets

- [[plans/phase-W8-commonloom-content-pipeline/FEAT-041]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-267]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-268]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-269]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-270]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-271]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-272]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-273]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-274]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-275]]
- [[plans/phase-W8-commonloom-content-pipeline/TASK-276]]
- [[plans/phase-W8-commonloom-content-pipeline/CHORE-095]]

## Related

- [[../website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]
- [[../website/docs/architecture/content-pipeline]]
- [[../website/docs/research/w8-content-pipeline-technology-research]]
- [[phase-W7-website-guide-prose]]

## Workflow Log

> [!INFO] Planned · 2026-05-10
> Phase W8 was opened after the Commonloom ADR, architecture spec, and
> technology research selected a reusable TypeScript Markdown compiler core with
> a thin website adapter.
