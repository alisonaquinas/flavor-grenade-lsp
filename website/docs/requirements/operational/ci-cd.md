# CI/CD Operational Requirements

## Scope

This specification defines the required CI, release, distribution, and
publishing behavior for Flavor Grenade LSP, the VS Code extension, and the
future GitHub Pages website.

It supplements [[website/docs/requirements/technical/index]] and must stay consistent with the repository git-flow
model:

- `develop` is the integration branch for feature and fix work.
- `main` is the released branch.
- Feature and fix pull requests target `develop`.
- Release pull requests target `main`.
- Published distribution artifacts are produced only from version tags whose
  commits are on `main`.

## Workflow Principles

- CI is the gate for correctness. Every PR and protected branch update must run
  the full unit test checks for the affected project areas.
- Publishing is not a branch push side effect. Public distribution and
  publishing jobs must be triggered by release tags.
- Tag-triggered publish workflows must prove the tag commit belongs to `main`
  before producing public artifacts.
- Test tags may exercise packaging and release machinery, but they must not
  publish public production artifacts.
- Release jobs must rebuild from source at the tag commit. They must not
  publish artifacts copied from a developer workstation.
- Workflow permissions must be minimal by default and expanded per job only
  when publishing, attestation, Pages deployment, or release creation requires
  it.
- Long-lived publish credentials are avoided where platform support allows
  OIDC or trusted publishing.

## CI Triggers

Continuous integration must run on:

- `pull_request` targeting `develop`.
- `pull_request` targeting `main`.
- `push` to `develop`.
- `push` to `main`.
- Release tag pushes, before any publish job runs.

CI workflows may use path filters for speed only when those filters cannot skip
required checks for the changed artifact. Release tag workflows must not rely
on path filters.

## Required CI Checks

Root server checks:

- Install root dependencies with the locked dependency graph.
- Run TypeScript typecheck with `bun run typecheck`.
- Run ESLint with `bun run lint`; warnings must fail CI.
- Run dependency policy checks with `bun run lint:dependencies`.
- Run formatting checks with `bun run format:check`.
- Run the full root unit test suite with coverage, currently `bun test
  --coverage` or the equivalent full unit-test command.
- Run the server build with `bun run build`.
- Run OFM documentation lint with `bun run lint:docs`.
- Run non-OFM Markdown lint with `markdownlint-cli2` using the repository
  exclusion set.

Extension checks:

- Install extension dependencies with `npm ci`.
- Run extension typecheck and bundle compilation with `npm run compile`.
- Run the full extension unit test suite with `npm test`.
- Run host tests with `npm run test:host` when extension behavior, activation,
  commands, or integration behavior changes.
- Run marketplace asset verification with
  `npm run verify:marketplace-assets`.
- Run package-target verification with `npm run verify:package-targets`.

Website checks, once the website implementation exists:

- Install website dependencies from the website lockfile or the chosen
  workspace lockfile.
- Run strict TypeScript typecheck.
- Run website lint with zero warnings.
- Run website unit tests.
- Run static build.
- Verify the generated output is static and suitable for GitHub Pages.
- Verify generated `sitemap.xml`, `robots.txt`, canonical URLs, and social
  metadata.
- Verify that website source remains under `website/src` and website tests
  remain under `website/tests`.
- Verify website internal Markdown, changelog entries, and source docstrings
  maintain the required `standard` documentation maturity where checks are
  automatable.

## Required Release Gates

No publish, release, package upload, or Pages deployment job may run unless the
required CI checks for that artifact have passed for the same tag commit.

Release workflows may implement this by:

- running the required CI jobs in the same workflow and using `needs`, or
- querying required successful check runs for the tag SHA before publishing.

The first option is preferred because it keeps release evidence inside the
same workflow run.

## Tag Strategy

Server and npm package tags:

- Production tags use `vX.Y.Z`.
- Test tags may use a suffix such as `vX.Y.Z-test.N`.
- Production `vX.Y.Z` tags may create GitHub Releases, binary artifacts, and
  npm publications.
- Test tags may create draft or prerelease artifacts and dry-run package
  publishing only.

VS Code extension tags:

- Production tags use `ext-vX.Y.Z`.
- Test tags may use a suffix such as `ext-vX.Y.Z-test.N`.
- Production `ext-vX.Y.Z` tags may publish VSIX artifacts to the Visual Studio
  Marketplace.
- Test tags may build, package, checksum, attest, and smoke-test VSIXs without
  publishing to the Marketplace.

Website tags:

- The public GitHub Pages website must deploy from a release tag whose commit
  is on `main`.
- If website releases share the server version, use the matching `vX.Y.Z` tag.
- If website releases need independent cadence, use `site-vX.Y.Z`.
- Test website tags may build and upload artifacts without deploying to the
  production Pages environment.

## Main-Branch Tag Guard

GitHub Actions tag events do not prove that a tag came from a branch. Every
production publish workflow must explicitly verify that the tag commit is
contained in `origin/main` before publishing.

Required guard behavior:

- Fetch `origin/main` with enough history to check ancestry.
- Fail the publish workflow if `git merge-base --is-ancestor "$GITHUB_SHA"
  "origin/main"` does not succeed.
- Run this guard before requesting publish credentials, creating releases,
  deploying Pages, or uploading production artifacts.
- Keep the guard enabled for server, npm, extension, GitHub Release, and
  website publish workflows.

## GitHub Pages Distribution

The GitHub Pages workflow must:

- Build the static website from the tagged source.
- Use the website `base` configured for the production hosting target.
- Run website lint, typecheck, unit tests, and build before deployment.
- Upload the generated static artifact only after checks pass.
- Deploy to the protected Pages environment only from production website tags
  that pass the main-branch tag guard.
- Use minimal permissions:
  - `contents: read`
  - `pages: write`
  - `id-token: write`
- Use concurrency so only one production Pages deployment runs at a time.
- Keep PR and `develop` runs as checks or previews only; they must not update
  the production GitHub Pages site.

## Package And Release Distribution

Server package distribution must:

- Publish npm packages only from production `vX.Y.Z` tags that pass CI and the
  main-branch tag guard.
- Use npm trusted publishing or OIDC when available.
- Generate provenance for production npm publishes.
- Keep test tags on dry-run publish behavior.

Binary release distribution must:

- Build binaries from the tag commit for each supported target.
- Upload artifacts with target-specific names.
- Generate checksums for downloadable artifacts.
- Create GitHub Releases only after binary builds pass.
- Mark test-tag releases as draft or prerelease.

VS Code extension distribution must:

- Build the Marketplace VSIX from `ext-vX.Y.Z` tags that pass CI and the
  main-branch tag guard.
- Verify each VSIX contains exactly one bundled `server/main.js` module and no
  native server executable payload.
- Generate checksums for VSIX artifacts.
- Attest VSIX provenance where supported.
- Smoke-test the packaged server module before Marketplace publish.
- Publish to the Visual Studio Marketplace only from production extension tags.

## Security Requirements

- Pin third-party GitHub Actions to immutable SHAs or a documented approved
  version policy.
- Set workflow-level permissions to `contents: read` unless a job needs more.
- Scope publish credentials to protected environments such as `npm-publish`,
  `vsce-publish`, or `github-pages`.
- Do not expose publish secrets to pull requests from forks.
- Do not run dependency install scripts in CI unless a specific job documents
  why scripts are required.
- Upload coverage, package, and release artifacts with explicit paths and
  `if-no-files-found: error` when absence indicates a broken build.

## Observability And Evidence

CI and release workflows must preserve useful evidence:

- Coverage artifacts for root unit tests.
- Website build artifact on website release workflows.
- VSIX artifacts and checksums on extension release workflows.
- Binary artifacts and checksums on server release workflows.
- Clear job names for typecheck, lint, unit tests, build, package, publish,
  and deploy stages.
- Release logs that distinguish test tags from production tags.

## Acceptance Criteria

- Pull requests to `develop` and `main` run the required full unit test checks.
- Pushes to `develop` and `main` run branch CI.
- Production publishing is never triggered by a plain branch push.
- Production publishing is triggered only by the appropriate release tag.
- Every production publish workflow verifies the tag commit is on `main`.
- Test tags exercise packaging without publishing production artifacts.
- GitHub Pages deploys only from production website tags on `main`.
- npm, GitHub Release, VSIX, and Pages publishing jobs are gated by successful
  CI for the same tag commit.

## Open Decisions

- Whether website production deploys share `vX.Y.Z` server release tags or use
  independent `site-vX.Y.Z` tags.
- Whether branch CI should always run extension tests or use safe path filters
  after the website implementation adds more jobs.
- Whether BDD should remain a separate release gate or become part of every
  branch CI run.
- Whether Pages preview deployments are needed for pull requests.
