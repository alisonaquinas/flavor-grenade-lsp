# Changelog

## [0.5.0] — 2026-05-30

### Added

- Recognize `.mdfignore` and `.mdfattributes` as Flavor Grenade workspace markers
  for activation, file watching, and local flavor evidence refreshes.
- Add selector support for writing `.mdfattributes` entries that apply to either
  the selected Markdown file or every Markdown file in the selected file's
  directory.
- Add extension-host coverage for `.mdfignore` and `.mdfattributes` refresh and
  selection workflows.

### Changed

- Prefer `.mdfattributes` over legacy project flavor config files for explicit
  file and directory flavor configuration.
- Preserve Auto Detect as the default extension behavior when no
  `.mdfattributes` rule applies.
- Update Marketplace and extension docs for the `.mdfignore` and `.mdfattributes`
  configuration workflow.

### Fixed

- Refresh local flavor evidence correctly when `.mdfignore` or `.mdfattributes`
  files are created, changed, or removed.

## [0.4.0] — 2026-05-26

### Added

- Recognize `.flavor-grenade.json`, `.flavor-grenade.jsonc`,
  `.flavor-grenade.yaml`, `.flavor-grenade.yml`, and Flavor Grenade
  `.editorconfig` directives anywhere TOML project config markers are used.
- Refresh extension activation, Marketplace README assets, and local flavor
  evidence when any supported project config marker appears, changes, or is
  deleted.

### Changed

- Rename the Marketplace listing to Multi-flavor Markdown Support.
- Host Marketplace README screenshots from <https://flavor-grenade.dev/>.
- Point extension metadata and Marketplace docs to <https://flavor-grenade.dev/>.
- Replace stale Marketplace imagery that still presented OFMarkdown language
  promotion as current behavior.

### Fixed

- Resolve project flavor config profiles consistently across supported config
  formats.
- Apply config override matching and scan limits consistently when extension
  evidence is refreshed.

## [0.3.0] — 2026-05-24

### Added

- Add syntax and context inference for Markdown flavor auto-detection when
  project config is absent.
- Add the `flavorGrenade.markdownStructuredProfiles` setting for Auto Detect,
  explicit profile lists, and `none`.
- Add client-side propagation and smoke-test coverage for Keep a Changelog,
  Common Changelog, and MADR structured Markdown profiles layered over base
  Markdown flavors.

### Changed

- Expand extension smoke-test workspaces with configured and inference-only
  changelog and MADR examples for every supported base flavor.

### Fixed

- Keep root-level generic smoke-test README files from being inferred as
  Obsidian Flavored Markdown.

## [0.2.4] — 2026-05-23

### Security

- Disable automatic `actions/setup-node` package-manager caching in the extension release workflow so dry-run and Marketplace release jobs do not rely on mutable implicit package caches.
- Keep extension release workflow cache hardening covered by the repository CI workflow verification tests.

## [0.2.3] — 2026-05-23

### Changed

- Normalize extension documentation around the current bundled JavaScript server module package model.
- Add local full-maturity guidance for extension source, scripts, tests, Marketplace evidence, and package-target verification areas.
- Refresh extension development dependency metadata for the current VS Code API and TypeScript toolchain.

## [0.2.2] — 2026-05-23

### Changed

- Update the extension API target and minimum VS Code version to 1.120.0.

### Security

- Refresh extension tooling transitive dependencies so public advisories for `qs`, `brace-expansion`, and `uuid` through `@azure/msal-node` are cleared.

### Fixed

- Replace bundled native server executables with a bundled JavaScript server module so Marketplace virus validation receives a non-native extension payload.

## [0.2.1] — 2026-05-23

### Fixed

- Build required server binaries before extension release package-target and host-test gates.
- Add dry-run release workflow coverage so test tags exercise VSIX packaging and publish-skip behavior before Marketplace release.

## [0.2.0] — 2026-05-23

### Added

- Add the `flavorGrenade.markdownFlavor` setting with Auto Detect plus every supported researched Markdown flavor.
- Add the **Flavor Grenade: Select Markdown Flavor** command and quick-pick selector.
- Add a dedicated Markdown flavor status-bar item that reports the active effective flavor and opens the selector.
- Propagate resource-specific selected and effective Markdown flavor state to the language server.

### Changed

- Keep file-backed `.md` documents in VS Code's built-in Markdown language mode while Flavor Grenade applies flavor-aware behavior.
- Show lifecycle status as `FG: Ready` without embedding the document count in the status-bar text.
- Document the Markdown flavor selector and updated Markdown-mode behavior in the Marketplace README and extension docs.

### Fixed

- Preserve server-resolved wiki-link and embed targets without client-side target reinterpretation.
- Resolve project `.flavor-grenade.toml` flavor evidence locally so the status-bar flavor display and server propagation agree.
- Harden extension-host update wait behavior for downloaded VS Code test runtimes.

## [0.1.4] — 2026-05-09

### Fixed

- Block command-triggered server startup in Restricted Mode and virtual workspaces.
- Keep restart, rebuild index, and show output commands from spawning the language server when the workspace environment is unsupported.

### Changed

- Ignore only the repository-root `.obsidian/` folder so nested fixture vault markers remain trackable.

## [0.1.3] — 2026-05-06

### Fixed

- Rebuilt Windows extension packages without Bun bytecode to avoid a startup crash in the bundled server executable.
- Added a Windows smoke test for the bundled `win32-x64` server binary before Marketplace publish.

## [0.1.2] — 2026-05-05

### Fixed

- Ensure Marketplace extension packages include the real PNG icon when built from Git LFS checkouts.

## [0.1.1] — 2026-05-04

### Fixed

- Replaced the placeholder Marketplace package icon with the no-text Flavor Grenade logo mark.

## [0.1.0] — 2026-05-04

### Added

- Initial Marketplace release of the Flavor Grenade VS Code extension.
- Bundled `flavor-grenade-lsp` server binaries for Linux, macOS, Windows, and Alpine targets.
- LanguageClient integration for wiki-link, embed, tag, heading, block-reference, diagnostic, navigation, rename, code-action, CodeLens, and semantic-token support.
- Status bar showing vault indexing state and document count.
- Commands: Restart Server, Rebuild Index, Show Output.
- Configuration: server path override, link style, completion candidate cap, diagnostic suppression, and server trace level.
- OFMarkdown language mode for detected Obsidian or Flavor Grenade vault notes, while generic Markdown remains Markdown.
- Extension development workflow with VS Code F5 launch, client/server watch tasks, and source-based LSP restart loop.
