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
- SCSS source lives under `website/src/styles`.
- Static passthrough files may live under `website/public` when Vite requires
  that convention.
- Generated production output lives under `website/dist` unless a later ADR
  documents a replacement output directory.

The website must not place implementation source under `docs/`,
`extension/docs/`, or `website/docs`. Those directories are documentation
sources and requirements sources, not application source code.

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
- `website/package.json` exposes a `test` script once implementation starts.
- Internal website Markdown is maintained at `standard` maturity.
- Website changelog practice follows Keep a Changelog and SemVer.
- Public website TypeScript APIs and modules have useful docstrings.
- No finished website documentation contains unresolved bootstrap placeholders.
