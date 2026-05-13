---
title: "Phase W8: Commonloom Content Pipeline"
phase: W8
status: complete
tags: [plans, website, markdown, content-pipeline, commonloom]
aliases: [Phase W8, Commonloom Content Pipeline, Website Markdown Pipeline]
updated: 2026-05-12
---

# Phase W8: Commonloom Content Pipeline

| Field | Value |
|---|---|
| Phase | W8 |
| Title | Commonloom Content Pipeline |
| Status | complete |
| Gate | Markdown copy, typed manifests, external Commonloom package integration, generated TypeScript records, migration, and website build gates pass |
| Depends on | Phase W7 |

## Objective

Move website copy authoring out of hand-maintained TypeScript content modules
and into Markdown documents with typed page-group manifests. The build should
generate deterministic TypeScript records that the existing Svelte pages consume
without committing generated files.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]] | Implement the accepted external Commonloom, typed-manifest, generated-TypeScript decision |
| [[website/docs/architecture/content-pipeline]] | Match the source, manifest, media, compiler, adapter, and generated output boundaries |
| [[website/docs/requirements/technical/source-layout-and-documentation]] | Add the documented content directories, generated output policy, and authoring affordances |
| [[website/docs/research/w8-content-pipeline-technology-research]] | Use the researched unified/remark/rehype/zod approach and avoid MDsveX/MDSX as the primary pipeline |

## Scope

### In Scope

- `website/src/content/copy/**/*.md` as the author-owned Markdown copy tree.
- `website/src/content/media/**` as the author-owned image and attachment tree.
- One typed `*.manifest.ts` file per page group.
- Git-ignored `website/src/content/generated/*.generated.ts` renderer inputs.
- An external `commonloom` package dependency for reusable Markdown parsing,
  validation, source tracing, and generic content records.
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

- Maintaining Commonloom library source under
  `website/src/content/pipeline/commonloom`.
- Publishing or versioning the Commonloom package from this repository.
- Runtime Markdown rendering in Svelte routes.
- MDsveX component embedding as the primary authoring model.
- Unbounded raw HTML passthrough.
- Content management UI.

## Architecture

Commonloom is an external TypeScript package during W8. It accepts project
configuration, manifests, Markdown files, and media roots, then returns validated
content records plus diagnostics. The website adapter translates those records
into generated TypeScript modules that preserve the existing page contracts.
Commonloom package source, release process, and reusable API maintenance live
outside this repository.

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
| Core | Depend on the external `commonloom` package for parser, validation contracts, diagnostics, source tracing, and media/link analysis |
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

- [[docs/plans/phase-W8-commonloom-content-pipeline/FEAT-041]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-267]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-268]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-269]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-270]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-271]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-272]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-273]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-274]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-275]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-276]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-277]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-278]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/TASK-279]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-096]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-097]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-098]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-095]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-099]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-100]]
- [[docs/plans/phase-W8-commonloom-content-pipeline/CHORE-101]]

## Related

- [[website/docs/adr/0002-use-page-group-markdown-manifests-for-website-copy]]
- [[website/docs/architecture/content-pipeline]]
- [[website/docs/research/w8-content-pipeline-technology-research]]
- [[phase-W7-website-guide-prose]]

## Workflow Log

> [!INFO] Planned · 2026-05-10
> Phase W8 was opened after the Commonloom ADR, architecture spec, and
> technology research selected a reusable TypeScript Markdown compiler core with
> a thin website adapter.
>
> [!INFO] Updated · 2026-05-11
> Commonloom is now published independently as the `commonloom` npm package.
> W8 no longer requires this repository to maintain
> `website/src/content/pipeline/commonloom`; local work is limited to package
> integration and the Flavor Grenade website adapter.

> [!SUCCESS] Package boundary executed · 2026-05-12
> TASK-279 removed `website/src/content/pipeline/commonloom`, switched website
> imports to `commonloom@0.1.0`, and passed the full local W8 gate. Phase W8 is
> in PR review pending PR #65 CI confirmation.

> [!SUCCESS] Completed · 2026-05-12
> PR #65 CI run `25705556117` passed after the package-boundary removal.
> Phase W8 is complete with no local Commonloom source remaining.
