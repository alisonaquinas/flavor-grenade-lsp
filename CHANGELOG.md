# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1](https://github.com/alisonaquinas/flavor-grenade-lsp/compare/v0.1.0...v0.1.1) (2026-04-21)


### Bug Fixes

* **ci:** migrate release-please to googleapis action and fix config ([e976963](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/e97696377a748db8eca28c8c552f9387d3a7ee5c))
* **package:** add repository field for npm provenance validation ([ca691dd](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/ca691dd6f2c121c828cbf58eae9aee3a375f4528))

## [Unreleased]

## [0.1.0] - 2026-04-20

### Added

- LSP server for Obsidian Flavored Markdown (OFM) over stdio transport
- Wiki-link, embed, and block-reference resolution across all vault files
- Tag indexing with vault-wide tag completions
- Go-to-definition, find-references, document highlights, hover, and code lens
- Rename support for files and headings with fragment-preserving cross-file updates
- Code actions for broken links and heading mismatches
- Diagnostic reporting for unresolved links, embeds, and block references
- BDD test suite (Cucumber) for end-to-end LSP scenario coverage
- Unit tests across resolution, handlers, vault scanning, and file watching
- Pre-commit hooks via Lefthook (ESLint + Prettier enforced before every commit)
- CI pipeline: typecheck, lint, format check, unit tests with coverage, build, and markdown lint
- Keyless OIDC trusted publishing to npm and Bun registry on semver tags (no stored token)

### Fixed

- Synchronous text document registration causing initialization race on some clients
- Windows vault URI normalization for correct cross-platform path handling
- Embed-resolver fragment handling and asset suffix matching
- Block-anchor, callout, frontmatter, and tag parsing correctness
- Code-lens VaultIndex resolution; rename now correctly preserves URL fragments
- Code-action kind scoping, message regex, and command field conformance
- Debug request handlers now conform to the `RequestHandler` async type contract

### Changed

- Package published as `flavor-grenade-lsp` (unscoped) on npmjs.com

---

[Unreleased]: https://github.com/alisonaquinas/flavor-grenade-lsp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alisonaquinas/flavor-grenade-lsp/releases/tag/v0.1.0
