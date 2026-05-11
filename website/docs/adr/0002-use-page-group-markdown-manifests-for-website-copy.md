---
status: accepted
date: 2026-05-10
decision-makers: Alison Aquinas
consulted: Codex
informed: Future website contributors
---

# Use page-group Markdown manifests for website copy

## Context and Problem Statement

The website currently keeps public page body content in large TypeScript
modules under `website/src/content`. That makes W-phase authoring difficult:
copy, route placement, metadata, article lists, and renderer records are all
close together, so adding a new phase such as W8 risks more hand-maintained
TypeScript and drift between page groups.

The website still needs typed records for Svelte rendering, route validation,
navigation dropdowns, SEO metadata, sitemap generation, and structured data.
The authoring source, however, should be easier for humans and LLM agents to
edit safely.

The decision question is: how should W8 split authoring copy from generated
website content records while staying inside the existing Vite, Svelte, and
TypeScript architecture?

## Decision Drivers

- Keep public copy easy to author as Markdown.
- Support full public-copy Markdown formatting instead of a narrow custom
  subset.
- Allow inline HTML for static document structures that Markdown cannot express
  cleanly.
- Support images in public copy without forcing authors back into TypeScript.
- Keep page placement explicit and reviewable.
- Avoid one new central registry that grows like the current content modules.
- Preserve typed generated records for the app.
- Generate TypeScript, not JSON, for renderer-consumed content records.
- Isolate Markdown compilation and validation behind a reusable TypeScript
  library boundary.
- Keep generated build output out of git.
- Let page-local metadata live with copy when that improves maintainability.
- Stay compatible with Vite and GitHub Pages static builds.

## Considered Options

- One manifest per page group.
- One central manifest for all public pages.
- Markdown files as implicit routes with no manifest.
- TypeScript manifests.
- Data-only manifests.

## Decision Outcome

Chosen option: "One manifest per page group".

Public copy will be authored as Markdown under `website/src/content/copy`.
Markdown frontmatter is the default source for page-local metadata such as
title, description, H1, related routes, SEO fields, image references, and
structured data hints. Inline HTML is allowed for static structures such as
figures, captions, and responsive images when Markdown is not expressive
enough.

The generator will support CommonMark plus GitHub Flavored Markdown formatting,
including heading levels, emphasis, strong emphasis, strikethrough, inline code,
fenced code blocks, ordered and unordered lists, task lists, blockquotes, links,
autolinks, images, tables, thematic breaks, escaped characters, and HTML
entities.

Page-group manifests will be direct child TypeScript files under
`website/src/content` with the `*.manifest.ts` suffix. They will map Markdown
files to public routes, route groups, ordering, generated output targets, and
any explicit overrides needed for placement or build behavior. The build will
write generated
TypeScript records under `website/src/content/generated`. That directory is
generated output and must be git-ignored.

Content-owned images will live under `website/src/content/media` unless a page
reuses an existing documented product asset. Generated TypeScript records
should preserve image source paths, resolved URLs, alt text or decorative
markers, optional captions, optional credit links, and page roles.

Manifests may only override explicitly declared fields needed for routing,
grouping, ordering, output targets, or documented metadata exceptions.
Frontmatter keeps page-local facts near the copy.

Generated page records will expose sanitized static HTML as the canonical body.
Compatibility section arrays may be generated while existing Svelte renderers
still need them, but authors should not maintain page copy as TypeScript
section arrays.

Public copy may use Obsidian wiki-links only when the generator resolves them
to public routes and emits standard crawlable URLs.

The Markdown compilation and validation core is **Commonloom**, a reusable
TypeScript package published outside this repository. It owns generic Markdown
parsing, frontmatter parsing, GFM support, inline HTML sanitization, image
extraction, source tracing, and normalized content records. It must not import
Svelte components, Flavor Grenade route modules, or product-specific data.

The Flavor Grenade website adapter will provide route ids, page groups,
`PageGroupManifest`, route resolution, approved media roots, and generated
TypeScript module formatting.

Commonloom package source, release automation, and API versioning are maintained
in the independent Commonloom repository. This repository consumes the
published `commonloom` package and keeps only Flavor Grenade-specific route,
renderer, adapter, and generated-output logic locally.

The selected content tooling is unified, remark, rehype, and zod. MDsveX,
MDSX, `vite-plugin-markdown`, `@goodforyou/vite-plugin-markdown-import`, and
`vite-plugin-svelte-md` are rejected as the primary W8 pipeline because they
solve Markdown import or Markdown-as-component workflows rather than validated
content compilation into typed records.

### Consequences

- Good, because W8 can add or revise a page group without editing a giant
  TypeScript body registry.
- Good, because Markdown copy, frontmatter, and route mapping have separate
  responsibilities.
- Good, because images and small semantic HTML structures can be authored with
  the document instead of as hand-maintained TypeScript records.
- Good, because generated records can keep the current app contract stable
  while authoring moves to Markdown.
- Good, because generated TypeScript keeps route ids, page groups, image
  records, and renderer contracts inside TypeScript validation.
- Good, because isolating the content compiler keeps most W8 logic reusable for
  other website projects.
- Good, because unified, remark, and rehype provide mature parsing,
  transformation, and sanitization primitives without project-specific Markdown
  parsing.
- Good, because group manifests can drive hub pages, dropdown inventories, and
  article ordering from one source.
- Bad, because the build now needs a content generation step before typecheck,
  tests, and production builds.
- Bad, because validation must catch drift between Markdown frontmatter,
  manifests, route ids, generated records, and public navigation.
- Bad, because inline HTML and images require safety, accessibility, and broken
  asset validation.
- Bad, because generated TypeScript is less portable than generated JSON for
  non-app tooling.
- Bad, because a reusable boundary adds API design work before the first W8
  implementation can be completed.

### Confirmation

The decision is confirmed when:

- `website/src/content/copy` contains committed public Markdown copy files.
- `website/src/content/media` contains committed content-owned images when
  public copy needs document-specific media.
- `website/src/content` contains one `*.manifest.ts` file per page group.
- Markdown frontmatter can provide page-local metadata.
- Inline HTML in public copy is validated and limited to safe static output.
- Public copy image references resolve in development and production builds and
  provide useful alt text or explicit decorative markers.
- Public copy wiki-links resolve to public routes or fail validation.
- The generation step writes TypeScript records to
  `website/src/content/generated`.
- `website/src/content/generated` is git-ignored.
- `website/src/content/generated/` is listed in `.gitignore`.
- `website/package.json` exposes `content:generate` and `content:check`.
- Generic Markdown compilation and validation modules do not import Svelte,
  website route modules, or Flavor Grenade product data.
- Website-specific adapters own route resolution and generated TypeScript
  formatting.
- Commonloom naming is reserved for the external package boundary; local source
  should not recreate `website/src/content/pipeline/commonloom`.
- The website renderer consumes generated TypeScript records instead of
  hand-authored page body TypeScript or generated JSON page data.
- Generated records are disposable and reproducible from Markdown copy plus
  page-group manifests.
- Validation fails for missing copy files, duplicate route ids, invalid related
  routes, unreferenced public copy, unsafe inline HTML, broken image
  references, missing image alt text, and committed generated records.
- Hub pages and navigation dropdowns use manifest or generated inventories
  rather than separate hand-authored article lists.

## Pros and Cons of the Options

### One manifest per page group

Use separate manifests for groups such as homepage and quickstart, how-to,
concepts, advanced usage, FAQ, and features. Each manifest maps Markdown copy
files to route ids, group ordering, and generated output targets.

- Good, because each page group stays small and reviewable.
- Good, because group-specific ordering and structured data requirements can be
  expressed near the relevant pages.
- Good, because it avoids replacing one huge TypeScript file with one huge
  manifest file.
- Bad, because cross-group validation must merge multiple manifests before it
  can detect duplicate route ids or broken related routes.

### One central manifest for all public pages

Use a single manifest that maps every Markdown copy file to every route and
generated record.

- Good, because global ordering and validation are easy to inspect in one
  file.
- Good, because the generator has one manifest entry point.
- Bad, because it recreates the current maintainability problem in a different
  format.
- Bad, because unrelated page groups would conflict more often during W-phase
  authoring.

### Markdown files as implicit routes with no manifest

Infer routes, page groups, ordering, and output records from Markdown file
paths and frontmatter alone.

- Good, because authors edit only Markdown.
- Good, because colocated frontmatter can describe most page-local metadata.
- Bad, because route placement, dropdown ordering, and generated output targets
  become implicit.
- Bad, because future route changes would require file moves or special
  frontmatter conventions.
- Bad, because the build would have less explicit information for validation.

### TypeScript Manifests

Use `*.manifest.ts` files that export one manifest object satisfying the
hand-authored `PageGroupManifest` interface.

- Good, because route ids and page groups are checked while authors edit.
- Good, because the generator can share source types with the website app.
- Good, because this matches the decision to generate TypeScript for renderer
  input.
- Bad, because manifests are less friendly to non-TypeScript tooling.

### Data-only Manifests

Use YAML, TOML, or JSON manifests.

- Good, because data-only manifests are easy for generic tooling to parse.
- Good, because authors do not need to touch TypeScript syntax.
- Bad, because route ids and page groups need a separate runtime validation
  pass before TypeScript can help.
- Bad, because it weakens the typed contract the W8 pipeline is trying to
  preserve.

## Generated Output Decision

Generated TypeScript is the canonical output consumed by the website renderer.
The generator may emit JSON only as a diagnostic or audit artifact, not as the
public page renderer input.

### Generated TypeScript

Write `.generated.ts` modules under `website/src/content/generated` and export
readonly records that satisfy hand-authored interfaces.

- Good, because route ids, page groups, structured data, and media records stay
  inside TypeScript validation.
- Good, because Vite can process imported image assets from generated media
  modules and return development and production URLs.
- Good, because generated modules can expose lookup maps and group inventories
  without runtime parsing.
- Bad, because generated TypeScript is tied to the app build toolchain.

### Generated JSON

Write JSON records under `website/src/content/generated` and import them from
the app.

- Good, because JSON is portable and easy to inspect.
- Good, because Vite supports JSON imports.
- Bad, because JSON cannot directly express TypeScript literal constraints or
  `satisfies` checks.
- Bad, because media URL handling would need extra TypeScript wrapper code.
- Bad, because renderer contracts could drift until runtime validation catches
  them.

### Both TypeScript and JSON

Write TypeScript for the app and JSON for tooling.

- Good, because tooling can inspect JSON without TypeScript parsing.
- Bad, because two generated artifacts can drift unless the generator validates
  both from the same in-memory model.
- Bad, because JSON has no current renderer need.

JSON may be added later as an audit report if CI or documentation tooling needs
it. It must remain generated output.

## Tooling Decision

Consume the published `commonloom` package for generic Markdown compilation and
validation. The Flavor Grenade website owns adapter code, manifests, route
resolution, and generated TypeScript formatting.

Commonloom package internals include Markdown and schema tooling such as:

- `unified`
- `remark-parse`
- `remark-gfm`
- `remark-frontmatter`
- `vfile-matter`
- `remark-rehype`
- `rehype-raw`
- `rehype-sanitize`
- `rehype-stringify`
- `unist-util-visit`
- `hast-util-to-string`
- `zod`

Optional Commonloom-backed behavior may use:

- `rehype-slug` or `github-slugger` for heading ids
- `shiki` for syntax highlighting

### Svelte or Vite Markdown Plugins

Use MDsveX, MDSX, `vite-plugin-markdown`,
`@goodforyou/vite-plugin-markdown-import`, or `vite-plugin-svelte-md`.

- Good, because these tools can be quick for Markdown-as-component workflows.
- Good, because MDsveX and MDSX integrate directly with Svelte preprocessing.
- Bad, because W8 needs manifest-driven validation, source traces, image
  records, wiki-link resolution, and generated TypeScript records.
- Bad, because adopting them as the primary pipeline would couple public copy
  to Svelte component compilation.

## Reusable Boundary Decision

The W8 content compiler should be reusable outside this website and is named
Commonloom.

Commonloom:

- parses Markdown and frontmatter
- applies GFM support
- sanitizes allowed inline HTML
- extracts headings, links, images, and source traces
- validates generic image and HTML constraints
- emits a normalized content model

Website adapter:

- loads Flavor Grenade manifests
- validates Flavor Grenade route ids and page groups
- resolves public routes and Obsidian wiki-links
- formats generated TypeScript for the existing renderer
- wires package scripts and CI

Commonloom is consumed as the external `commonloom` package. Its source and
release process are out of scope here; W8 maintains only the Flavor
Grenade-specific website adapter.

## Generated Page Shape

Generated page records expose sanitized static HTML as the canonical body:

- route id
- source trace
- summary
- `bodyHtml`
- heading outline
- extracted links
- extracted media records
- structured data hints

Source trace includes the Markdown path, manifest path, content hash, heading
ids, and link or image source lines where the parser can provide them.

## Validation And Tooling

The website must expose `content:generate` and `content:check` package scripts.
Build, typecheck, and test must run after generation or invoke generation
directly. Generated records are TypeScript-checked through the app type graph.
ESLint and Prettier may exclude generated files if the exclusion is explicit.

## More Information

- [[../architecture/content-pipeline]]
- [[../requirements/technical/source-layout-and-documentation]]
- [[../requirements/functional/public-pages]]
- [[../requirements/functional/navigation-and-routing]]
- [[0001-use-vite-svelte-typescript-scss-and-github-pages-for-the-website]]
- Vite documentation supports JSON imports and asset URL imports. W8 still
  chooses generated TypeScript for renderer input so public content remains
  part of the app type graph.

Revisit this decision if:

- page-group manifests become too small to justify separate files,
- generated records need framework-native content collections,
- non-app tooling needs a committed portable content artifact,
- the external Commonloom API no longer fits the website adapter,
- Commonloom changes its public API independently,
- route generation moves to a dedicated static-site framework, or
- public copy authoring needs non-Markdown content blocks that frontmatter and
  manifests cannot represent cleanly.
