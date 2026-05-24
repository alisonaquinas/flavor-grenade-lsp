# Changelog

All notable changes to the Flavor Grenade website will be documented in this
file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The website is a private package and publishes from `site-v*` release tags.

## [Unreleased]

### Changed

- Replace the GitHub Pages release workflow with an AWS S3 publishing workflow
  that uses GitHub Actions OIDC, `site-v*` tags, and the protected
  `website-production` environment.

## [0.0.0] - 2026-05-23

### Added

- Add the initial Vite, Svelte, TypeScript, and SCSS static website package.
- Add public documentation pages for quickstart, VS Code extension setup,
  how-to workflows, advanced usage, FAQ, and LLM wiki concepts.
- Add generated content tooling, route metadata, sitemap, robots file, JSON-LD
  skeletons, and content validation tests.
- Add website CI checks for lint, typecheck, tests, build, and release evidence.
- Add tag-triggered website release workflow support for `site-v*` tags.
