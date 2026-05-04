# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/alisonaquinas/flavor-grenade-lsp/compare/v0.1.2...v0.2.0) (2026-05-04)


### Features

* add ofmarkdown language mode ([d5296dc](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/d5296dcd27fb7ad423e08ca31fdfa14be1988728))
* add VS Code extension client and CI release workflow ([ac309ae](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/ac309aec1a1800c3a935d981522d88f8bc7f99dc))


### Bug Fixes

* add workspace/executeCommand handler and fix rootUri lifecycle ([57c8ef2](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/57c8ef213a51c01492bf7abd57b2f6bbe01e32f0))
* add workspace/executeCommand handler and fix rootUri lifecycle ([bc7ddf1](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/bc7ddf134a8ce1b5786178224efbfe9e003d18bc))
* align status notification payload with extension's expected shape ([3bede9d](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/3bede9dc921cfc17b5e86572440d36f19025f4c3))
* centralize extension binary build ([45465f0](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/45465f042147215205b74c34f22cf41faf24e804))
* copy built binary to extension/server/ after compilation ([d88baf5](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/d88baf5134f909e96cf2bdb29a2a6e582aa1f4c9))
* decode URI before stripping Windows drive letter prefix ([265a82a](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/265a82adad7c4dc560f4ed8fb43571f074f1d874))
* improve extension build and completions ([ac6a086](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/ac6a086113ce7aa13634154d9ea82ced5c329eb6))
* lint docs without folder exclusions ([17b3d62](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/17b3d62f047d59e956feea055110b8e2c900e26a))
* make ofmarkdown promotion best effort ([ad5c7ea](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/ad5c7ea9f911156b488705f01d686dc34175a746))
* remove executeCommandProvider to prevent command registration conflict ([dbe0c17](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/dbe0c17227d1da90bc7fcba903e70f77bfa63b8e))
* scope obsidian docs lint ([345bb3f](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/345bb3f36c800a333ccc1255109b32e8ecf80044))
* use custom request method for Rebuild Index command ([4d0fd09](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/4d0fd09abbc2925da22f9f26d4e3c9af8d760c08))


### Miscellaneous

* prep extension test release ([cb60f6a](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/cb60f6a403cc9e6103805f1cb503a27ac8de2fa0))
* prep extension v0.1.0 release ([43313c6](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/43313c6dac13819c8f0dad5893e782680a001182))
* rename marketplace extension package ([d280a94](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/d280a948f2b3f091005fac6b150e8f8b1ba45679))


### Documentation

* add BDD feature and DDD bounded context for VS Code extension ([8ddf418](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/8ddf418ea0342541906eb437ee2c050ed94075c2))
* add extension test coverage plans to test index and matrix ([dab0ff5](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/dab0ff5c987b29045df97ea2ba0385d7a04531a0))
* add VS Code extension design spec, ADR, and phase plans E1-E5 ([a3351cb](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/a3351cb4966c7a31c8df9c84d72574b142ffaea6))
* add VS Code extension publishing research report ([9e9f97e](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/9e9f97e3329ce71f8151ef32faac88d5251cbfd8))
* audit normalization — cross-refs, ledger, catalog, frontmatter ([8cc69cb](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/8cc69cb5e77c78aaee59fda3b5459020fe1981e3))
* decompose extension phases E1-E5 into ticket folders ([efa52c9](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/efa52c95334b0c14136dd482782fd7ba2dbdffec))
* fix review findings — status callouts, wikilinks, dates, and data integrity ([5ddb230](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/5ddb23081ae2ec983080b5992e05a8794ae7ee2c))
* plan ofmarkdown language mode ([220625c](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/220625cf00c79cf11ce0e94dae33c46a77a52e8f))

## [0.1.2](https://github.com/alisonaquinas/flavor-grenade-lsp/compare/v0.1.1...v0.1.2) (2026-04-21)


### Bug Fixes

* **ci:** add publish to release-please workflow, fix bun publish and CHANGELOG lint ([8fbccd8](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/8fbccd81a21156d9655f1dc54f223dd6e79adaed))
* **ci:** drop Bun registry publish step — no OIDC support ([5cb642c](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/5cb642c2f0726d3de5e99ab32ce85099828c465e))
* **ci:** use explicit globs for markdownlint-obsidian to exclude templates and BDD fixtures ([ebabe5e](https://github.com/alisonaquinas/flavor-grenade-lsp/commit/ebabe5ea6bbd8d38dd922c2e134b815cd6b9ca48))

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
