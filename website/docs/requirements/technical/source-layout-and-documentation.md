# Source Layout And Documentation Technical Requirements

## Scope

This specification defines where website source and tests must live and how
the website documentation set must be maintained over time.

It applies to:

- website source code
- website tests
- internal Markdown under `website/docs`
- website architecture and ADR docs
- website changelog entries
- TypeScript source docstrings and module comments

## Source Layout Requirements

Website implementation source must live under `website/src`.

Required source boundaries:

- Svelte components, app shell, routes, and UI logic live under `website/src`.
- TypeScript route, metadata, content, and SEO modules live under
  `website/src`.
- Public website copy Markdown lives under `website/src/content/copy`.
- Public website content media lives under `website/src/content/media` unless
  it is an existing product asset reused from a documented product asset path.
- Page-group content manifests live as direct child files under
  `website/src/content` with the `*.manifest.*` suffix.
- Generated TypeScript content records live under
  `website/src/content/generated` and are build output, not source of truth.
- SCSS source lives under `website/src/styles`.
- Static passthrough files may live under `website/public` when Vite requires
  that convention.
- Generated production output lives under `website/dist` unless a later ADR
  documents a replacement output directory.

The website must not place implementation source under `docs/`,
`extension/docs/`, or `website/docs`. Those directories are documentation
sources and requirements sources, not application source code.

`website/src/content/generated` must be git-ignored. Contributors must update
Markdown copy files, frontmatter, or manifests instead of editing generated
records directly.

## Test Layout Requirements

Website tests must live under `website/tests`.

Required test boundaries:

- Unit tests for TypeScript utilities and content transforms live under
  `website/tests`.
- Component tests for Svelte components live under `website/tests`.
- Accessibility, routing, SEO, and build-output smoke tests live under
  `website/tests`.
- Test fixtures may live under `website/tests/fixtures`.
- Generated test output must not be committed.

The website must provide a `test` script that runs the website test suite from
`website/`. Repository-level CI may call that script from the root.

## Standard Documentation Maturity

Website documentation must be maintained at `standard` maturity according to
the `$software-design:well-documented` skill.

For the website, `standard` maturity means:

- `website/docs/requirements` stays accurate for user, functional, technical,
  design, and CI/CD requirements.
- `website/docs/architecture` explains the meaningful architecture boundaries.
- `website/docs/adr` records durable architecture decisions.
- Folder-level docs are added for doc-worthy website source areas once
  implementation begins.
- Docs are evidence-first: commands, links, routes, file paths, and workflow
  statements must match the repository.
- Stale commands, broken links, vague placeholders, and implementation drift
  are treated as documentation defects.

Standard maturity does not require recursive docs for every small folder. Add
folder-level documentation when a directory is an entrypoint, public boundary,
high-change area, or has local invariants that are not obvious from filenames.

## Internal Markdown Requirements

Internal Markdown under `website/docs` must:

- remain linted by `markdownlint-obsidian`
- use Obsidian-style links only where the website docs vault supports them
- keep public-facing content separate from internal planning
- include architecture or ADR updates when technical direction changes
- avoid bootstrap placeholders in finished requirements and architecture docs
- keep diagrams, examples, and file paths aligned with the actual repository

Markdown changes that affect website behavior should update the relevant
requirement, architecture page, ADR, or changelog entry in the same change set.

## Public Copy Authoring Requirements

Public page copy under `website/src/content/copy` must:

- be authored as Markdown
- target CommonMark plus GitHub Flavored Markdown
- allow inline HTML when Markdown cannot express the needed static structure
- keep page-local metadata in frontmatter when practical
- avoid internal ticket, phase, and implementation-ledger language in
  user-facing prose
- use descriptive public links that can be converted into route URLs
- reference local images with useful alt text or an explicit decorative marker
- keep examples concrete enough to verify against generated page records

Inline HTML in public copy must remain static and accessible. Content
generation must reject scripts, event handler attributes, and embeds that create
runtime behavior outside the website component model.

Content media under `website/src/content/media` must:

- be committed source, not generated output
- use stable filenames suitable for public URLs
- include useful alt text in Markdown, frontmatter, or generated image records
- support optional captions, credit links, and page roles such as body image,
  hero image, proof image, or social image
- resolve in development and production builds without broken-image indicators

Page-group manifests under `website/src/content` must:

- be split by page group instead of one central registry
- live as direct child files named with the `*.manifest.*` suffix
- map each public route to exactly one Markdown copy file
- define ordering for group hubs, dropdowns, and article lists
- identify generated TypeScript output targets consumed by the Svelte renderer
- fail validation when they reference missing copy files, duplicate route ids,
  or invalid related route ids

Markdown frontmatter is the default source for page-local metadata such as
title, description, H1, related routes, SEO fields, and structured data hints.
Manifests may only override explicitly declared fields needed for routing,
grouping, ordering, output targets, or documented metadata exceptions.
Frontmatter may also declare hero, proof, or social image references when those
images are part of page metadata rather than body copy.

Generated content modules under `website/src/content/generated` must:

- be TypeScript, not JSON, for renderer-consumed content records
- export readonly records that satisfy hand-authored public interfaces
- preserve literal route ids and page groups for TypeScript validation
- import local content media when Vite asset URL resolution is required
- contain no business logic beyond constants, indexes, and simple lookup maps
- be disposable and reproducible from Markdown copy, content media, and
  page-group manifests

Generated JSON may exist only as a diagnostic or audit artifact. It must not be
used as the public page renderer input and must not be committed unless a later
ADR changes that rule.

## Website Changelog Requirements

Website-visible changes must be tracked with the `$shared-skills:changelog`
standard.

Required changelog behavior:

- Keep a `[Unreleased]` section at the top.
- Categorize entries under Keep a Changelog headings:
  - `Added`
  - `Changed`
  - `Deprecated`
  - `Removed`
  - `Fixed`
  - `Security`
- Write entries from a user perspective, not as copied git log messages.
- Use SemVer version sections when releasing website changes.
- Use ISO 8601 release dates: `YYYY-MM-DD`.
- Preserve old release entries.
- Maintain compare links for released versions.

If website releases share the root package cadence, the root `CHANGELOG.md` may
carry website entries under the appropriate release section. If the website
uses an independent release cadence, create and maintain
`website/CHANGELOG.md`.

## Source Docstring Requirements

Website source code must use documentation comments at `standard` maturity.

Required TypeScript documentation:

- Public modules that define routes, metadata, content transforms, build
  helpers, or shared UI utilities need a short file-level header or module
  comment.
- Exported functions, classes, interfaces, type aliases, and constants need
  TSDoc or JSDoc when they are consumed outside their defining file.
- Non-obvious lifecycle, browser, accessibility, SEO, or build behavior needs a
  nearby comment.
- Comments must describe real behavior, not aspirational behavior.
- Generated bootstrap comments must be refined before merge or explicitly
  reported as remaining bootstrap text.

Do not add comments that merely restate a function name or TypeScript type.

## Maintenance Gates

Website development and maintenance must keep these checks green:

- Markdown lint for `website/docs`.
- Public copy and manifest validation for `website/src/content`.
- Public content media validation for broken image references, missing alt
  text, and unsafe inline HTML.
- Website TypeScript typecheck.
- Website lint with zero warnings.
- Website tests.
- Website static build.
- Changelog format review before release.
- ADR or architecture update when a durable technical decision changes.

CI should fail when source layout, tests, docs, or changelog conventions are
violated in ways that can be checked automatically.

## Acceptance Criteria

- Website implementation source exists only under `website/src`.
- Website tests exist only under `website/tests`.
- Public website copy is authored in `website/src/content/copy`.
- Public content media is authored in `website/src/content/media` or reused
  from documented product asset paths.
- Page-group manifests named `*.manifest.*` map Markdown copy files to public
  page records.
- Generated TypeScript records are written under
  `website/src/content/generated` and are not committed.
- `website/package.json` exposes a `test` script once implementation starts.
- Internal website Markdown is maintained at `standard` maturity.
- Website changelog practice follows Keep a Changelog and SemVer.
- Public website TypeScript APIs and modules have useful docstrings.
- No finished website documentation contains unresolved bootstrap placeholders.
