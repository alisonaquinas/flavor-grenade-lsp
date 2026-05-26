# Changelog

## [0.1.0] - 2026-05-26

### Added

- Scaffold the initial Flavor Grenade LSP skill product with wrapper commands,
  runtime manifest, examples, docs, and validation hooks.
- Add Claude and Codex plugin manifests, hooks, commands, embedded LSP metadata,
  marketplace/catalog metadata, and skill-local package validation.
- Add skill release packaging support for runtime-specific archives and release
  version stamping.

### Changed

- Move the skill source into the plugin tree and align plugin assets with the
  embedded skill layout.
- Stamp plugin, skill, marketplace, compatibility, and schema versions during
  skill release packaging.
- Normalize skill documentation, examples, metadata, and JSON schema guidance.

### Fixed

- Align the Codex plugin manifest, plugin catalog, and marketplace catalog with
  the validator expectations.
- Allow unsigned skill PR dry runs while preserving stricter release-time
  runtime provenance checks.
- Stamp skill docs from the selected runtime provenance during release
  packaging.

### Security

- Package plugin runtime artifacts from signed LSP server releases instead of
  building local server executables during skill release.
- Require signed runtime provenance and digest validation before a runtime can
  be embedded in skill artifacts.
- Harden signed runtime fetch validation, skill packaging fixtures, and
  security-sensitive release setup.
