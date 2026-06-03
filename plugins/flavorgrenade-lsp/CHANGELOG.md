# Changelog

## [0.2.2] - 2026-06-03

### Changed in 0.2.2

- Stamp skill, plugin, marketplace, compatibility, and JSON schema metadata for
  the Flavor Grenade LSP `0.7.2` server patch release.
- Keep the skill package version aligned with the server dependency and CI
  tooling maintenance release.

## [0.2.1] - 2026-05-31

### Changed in 0.2.1

- Stamp skill, plugin, marketplace, compatibility, and JSON schema metadata for
  the Flavor Grenade LSP `0.7.1` server patch release.
- Keep the skill package version aligned with the server hotfix that restores
  signed npm package evidence attachment during tag releases.

## [0.2.0] - 2026-05-30

### Added in 0.2.0

- Document `.fgignore` and `.fgattributes` workflows for skill users, including
  nested configuration files, negated patterns, directory-scoped flavor rules,
  and Auto Detect fallback.
- Stamp the skill manifest, marketplace metadata, and compatibility docs for
  Flavor Grenade LSP `0.7.x`.

### Changed in 0.2.0

- Update skill guidance so explicit flavor configuration uses `.fgattributes`
  and ignored files are excluded with `.fgignore`.
- Align command examples and JSON schema notes with the `0.2.0` skill and
  `0.7.0` server release pairing.

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
