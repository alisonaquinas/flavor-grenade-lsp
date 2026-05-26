# Changelog

All notable changes to the Flavor Grenade website will be documented in this
file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The website is a private package and publishes from `site-v*` release tags.

## [0.1.0] - 2026-05-26

### Added

- Add public guides for choosing Markdown flavors, using structured profiles,
  and applying Flavor Grenade code actions.
- Add concept pages for the Markdown flavor model and structured profile flags.
- Add markdown foreground assets for website UI texture and illustration.
- Add skill install guidance and a hero command copy control for installing the
  Flavor Grenade skill plugin with `npx skills`.
- Add grenade palette design tokens and contact sheets for visual review.

### Changed

- Replace the GitHub Pages release workflow with an AWS S3 publishing workflow
  that uses GitHub Actions OIDC, `site-v*` tags, and the protected
  `website-production` environment.
- Refresh website copy for flavor-aware Markdown, Auto Detect, CommonMark
  fallback, structured profiles, hovers, symbols, folds, semantic tokens, and
  code actions.
- Refresh website styling with the grenade color palette, markdown texture
  backgrounds, stronger docs surface contrast, and aligned hero install
  controls.

### Fixed

- Fix website install card icon rendering.
- Keep hero install buttons and the skill plugin copy control aligned across
  desktop and mobile layouts.

## [0.0.0] - 2026-05-23

### Added

- Add the initial Vite, Svelte, TypeScript, and SCSS static website package.
- Add public documentation pages for quickstart, VS Code extension setup,
  how-to workflows, advanced usage, FAQ, and LLM wiki concepts.
- Add generated content tooling, route metadata, sitemap, robots file, JSON-LD
  skeletons, and content validation tests.
- Add website CI checks for lint, typecheck, tests, build, and release evidence.
- Add tag-triggered website release workflow support for `site-v*` tags.
