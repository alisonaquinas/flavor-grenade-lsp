---
title: Marksman VSCode Feature Parity For OFMarkdown
tags:
  - research/marksman-vscode
  - research/ofmarkdown
  - roadmap/extension
aliases:
  - Marksman VSCode Parity Research
  - VS Code Extension Feature Parity
updated: 2026-05-06
---

# Marksman VSCode Feature Parity For OFMarkdown

> [!NOTE] Scope
> This report inspects the public
> `https://github.com/artempyanykh/marksman-vscode` repository and Marketplace
> listing. It compares the Marksman VSCode extension wrapper against the current
> Flavor Grenade VS Code extension, then lists feature candidates that would
> bring the extension into parity or better for OFMarkdown files.

## Executive Summary

Marksman VSCode is a thin VS Code client around the Marksman language server.
Its public extension surface is:

- activate only when `.marksman.toml` is present, plus explicit restart command
- start the server from user custom command, PATH, or GitHub release download
- register a `markdown`-only `LanguageClient`
- expose restart and output commands
- expose custom command bridges for server-driven show-references and follow-link
  actions
- show a status bar item with server state and document count
- advertise experimental client capabilities for code lens references,
  follow-links, and status notifications
- show Marketplace screenshots for hover, completions, references, and
  diagnostics

Flavor Grenade already exceeds Marksman VSCode on normal-user distribution:
platform-specific VSIXs bundle the server binary, avoid runtime downloads, and
support an explicit `ofmarkdown` language id. The strongest parity work is VS
Code polish: activation precision, command bridges for OFM-native actions,
extension-host tests, Marketplace visual proof, richer status/actions, and
OFMarkdown-specific editor contributions.

## Marksman VSCode Baseline

| Area | Marksman VSCode behavior | Flavor Grenade parity target |
|---|---|---|
| Activation | `workspaceContains:.marksman.toml`; restart command activation | Activate for Obsidian and Flavor Grenade vaults without hijacking generic Markdown |
| Server discovery | Custom command, PATH lookup, GitHub release download | Bundled binary first; keep developer escape hatch; no runtime download for users |
| Language selector | `file` + `markdown` only | `file` + `markdown` and `ofmarkdown`, with dynamic promotion |
| Commands | Restart server, show output | Restart, rebuild index, show output, plus OFM command bridges |
| Custom bridges | Show references and follow link commands invoked from server data | Bridge server code lens and commands into VS Code-native UI actions |
| Status bar | Init, ok with doc count, dead states | Indexing, ready, error, vault count, doc count, quick actions |
| Configuration | Custom command, command cwd, server trace | Server path, link style, candidates, suppressed diagnostics, trace; add runtime toggles |
| Marketplace proof | Screenshots for hover, completion, references, diagnostics | Screenshots or GIFs for OFMarkdown mode, embeds, block refs, tags, callouts, status |
| Packaging | Bundled JS client; server acquired at runtime | Platform VSIXs with bundled server and smoke-tested executable |
| Tests | Placeholder extension test | Real extension-host integration tests for activation, commands, language mode, and crash states |

## Existing Flavor Grenade Coverage

Current Flavor Grenade extension coverage:

- Bundled server command resolution with user override and development-mode
  `node dist/main.js` path.
- `LanguageClient` for `markdown` and `ofmarkdown`.
- File watcher for `**/*.md`.
- Initialization options for link style, completion cap, and diagnostic
  suppression.
- Status bar driven by `flavorGrenade/status`.
- Palette commands: restart server, rebuild index, show output.
- Dynamic `ofmarkdown` language id assignment from `.obsidian/` ancestors or
  server membership.
- Marketplace-safe platform VSIX packaging with target-specific server binaries.
- Explicit Restricted Mode and virtual workspace declarations.

## Parity Features To Add

### P1: Activation Precision And Cold-Start UX

**Goal:** Match Marksman's project-scoped activation without making users create
a marker file just to use an Obsidian vault.

Feature candidates:

- Add `workspaceContains:.obsidian` and
  `workspaceContains:.flavor-grenade.toml` activation events.
- Keep `onLanguage:markdown` and `onLanguage:ofmarkdown` only if needed for
  single-file and late-open behavior.
- Gate expensive startup work behind a quick vault membership check.
- Show a clear inactive state when a user opens generic Markdown outside a
  vault.
- Document exactly when the extension activates and when it remains idle.

Why it matters:

Marksman avoids running on random Markdown by requiring `.marksman.toml`.
Flavor Grenade can be equally precise while using Obsidian's native `.obsidian/`
marker.

### P1: VS Code Command Bridges For Server Actions

**Goal:** Match Marksman's custom show-references and follow-link bridges, then
extend them for OFMarkdown.

Feature candidates:

- Register a command that accepts LSP locations and calls
  `editor.action.showReferences`.
- Register a command that accepts a source/target location and calls
  `editor.action.goToLocations`.
- Use those commands from code lens items when VS Code-native commands produce
  better UI than raw LSP commands.
- Add command bridges for OFM-specific actions:
  open embed target, show backlinks, show outlinks, reveal vault root, and show
  tag references.
- Keep command payloads plain JSON-serializable so they can cross the
  LanguageClient boundary safely.

Why it matters:

LSP covers the core protocol, but VS Code has native UI commands for references
and location pickers. Bridging into those commands can make OFM features feel
like first-party VS Code behavior.

### P1: Extension-Host Test Suite

**Goal:** Replace placeholder-style tests with real extension behavior tests.

Feature candidates:

- Test activation in a workspace with `.obsidian/`.
- Test activation in a workspace with `.flavor-grenade.toml`.
- Test generic Markdown remains `markdown`.
- Test qualifying vault documents become `ofmarkdown`.
- Test restart, rebuild-index, and show-output command registration.
- Test status bar text transitions from starting to ready using a mocked
  LanguageClient or test server.
- Test custom server path failures show a useful error and do not leave orphaned
  processes.

Why it matters:

Marksman VSCode has only a sample extension test in the public repo. Flavor
Grenade can do better and protect the fragile VS Code integration surface.

### P1: Marketplace Evidence For OFMarkdown

**Goal:** Match Marksman's visible Marketplace proof, with OFMarkdown-specific
screenshots.

Feature candidates:

- Add README and Marketplace images for:
  - OFMarkdown language mode promotion
  - wiki-link completion
  - heading and block-anchor completion
  - embed diagnostics and hover
  - tag completion and tag hover
  - callout completion
  - reference code lens
  - status bar indexing state
- Add short animated GIFs only if they stay small and Marketplace-safe.
- Ensure all Marketplace images are PNG/JPEG and render from packaged README
  paths.

Why it matters:

Marksman shows users what they get before installation. Flavor Grenade's
Marketplace page should prove the OFMarkdown-specific value immediately.

### P2: Rich Status Bar And Quick Actions

**Goal:** Keep the existing status bar and make it operationally useful.

Feature candidates:

- Add tooltip sections for active vault root, vault count, document count,
  indexing state, server version, and last error.
- Add status bar warning states for missing binary, crashed server, disabled
  workspace trust, unsupported virtual workspace, and oversized vault.
- Add status bar command menu:
  restart server, rebuild index, show output, copy server path, open vault root.
- Surface server crash exhaustion clearly instead of relying only on the output
  channel.

Why it matters:

Marksman displays state and doc count. Flavor Grenade can make the status bar a
compact control surface for vault health.

### P2: Configuration Completeness

**Goal:** Keep the current settings and expose client-side behavior toggles users
will expect.

Feature candidates:

- Add `flavorGrenade.languageMode.enabled`.
- Add `flavorGrenade.activation.requireVaultMarker` for users who want
  Marksman-style strict activation.
- Add `flavorGrenade.statusBar.enabled`.
- Add `flavorGrenade.rebuildIndex.onWorkspaceChange`.
- Add `flavorGrenade.semanticTokens.enabled` if VS Code users need an extension
  side escape hatch.
- Restart or notify only when a setting actually requires a restart.

Why it matters:

Marksman keeps extension config small. Flavor Grenade needs a few extra toggles
because it changes VS Code language mode and bundles its runtime.

### P2: OFMarkdown Editor Contributions

**Goal:** Use the `ofmarkdown` language id for useful VS Code contributions,
not only identification.

Feature candidates:

- Add OFMarkdown snippets for callouts, embeds, wiki-links, aliases
  frontmatter, tag frontmatter, and block anchors.
- Add language-specific configuration for comments, brackets, surrounding pairs,
  folding markers, and word pattern tuned for tags and wiki-links.
- Add semantic token color customization guidance or optional theme snippets.
- Add keybindings scoped to `editorLangId == ofmarkdown` for common commands.

Why it matters:

Marksman does not create a separate language id. Flavor Grenade does, so it
should use that identity to make OFMarkdown editing better without affecting
generic Markdown.

### P2: Workspace Trust And Remote Behavior

**Goal:** Be explicit and testable about where the extension can run.

Feature candidates:

- Keep `extensionKind: ["workspace"]` so the binary runs next to vault files in
  remote windows.
- Add tests or manual verification docs for WSL, SSH, Dev Containers, and
  Windows local installs.
- In Restricted Mode, show a clear disabled state and command message.
- In virtual workspaces, avoid starting the server and explain that vault
  indexing requires a real file system.

Why it matters:

Marksman's runtime download/PATH model has different failure modes. Flavor
Grenade's bundled binary model is better for offline installs, but remote and
trust behavior must be obvious.

### P2: Language Mode Membership Refresh

**Goal:** Make `ofmarkdown` assignment resilient as workspace folders change.

Feature candidates:

- Refresh membership after status `ready`, rebuild-index completion, workspace
  folder changes, and visible editor changes.
- Revert `ofmarkdown` to `markdown` only when the server says the file no longer
  belongs to a vault and no `.obsidian/` ancestor exists.
- Add a hidden diagnostic/log entry for failed membership requests.
- Add tests for synthetic close/open events produced by
  `setTextDocumentLanguage`.

Why it matters:

The current controller promotes documents. Long-running sessions also need
stable behavior after folders are added, removed, or reindexed.

### P3: First-Run And Troubleshooting Experience

**Goal:** Make install and failure states self-explanatory.

Feature candidates:

- Add a first-run notification when a vault is detected and indexing begins.
- Add a command: `Flavor Grenade: Open Troubleshooting`.
- Add a command: `Flavor Grenade: Copy Diagnostic Info` with extension version,
  server version, platform, server path, vault count, doc count, and last error.
- Add README troubleshooting entries for binary missing, crash loop, no
  OFMarkdown promotion, no completions, and stale index.
- Offer a rebuild-index prompt when the server reports an inconsistent index.

Why it matters:

Marksman can fail during binary discovery/download. Flavor Grenade can fail
during binary launch, workspace trust, language promotion, and vault indexing.
Users need fast local evidence.

### P3: Built-In VS Code Views

**Goal:** Go beyond Marksman VSCode with OFMarkdown graph surfaces.

Feature candidates:

- Add an optional activity-bar or explorer view for vault health.
- Show backlinks, outlinks, unresolved links, orphan notes, tags, and embeds.
- Keep the view read-only at first, backed by custom server requests.
- Allow clicking entries to navigate with VS Code locations.

Why it matters:

This is not needed for parity, but it is a natural VS Code-native surface for
OFMarkdown vault intelligence.

### P3: Update And Compatibility Guardrails

**Goal:** Keep client/server versions aligned across platform packages.

Feature candidates:

- Query server version after startup and show mismatch warnings.
- Include target platform and server build metadata in status diagnostics.
- Add a packaged-VSIX smoke test that starts the extension host, not only the
  server executable.
- Validate that each platform VSIX contains exactly one matching server binary.

Why it matters:

Flavor Grenade's platform-specific distribution avoids runtime downloads, but
it introduces package-target correctness risks.

## Suggested Roadmap

| Priority | Theme | Suggested delivery slice |
|---|---|---|
| P1 | Activation precision | Add vault marker activation events and startup gating |
| P1 | Command bridges | Show references, follow link, backlinks, outlinks, open embed |
| P1 | Tests | Extension-host tests for activation, commands, status, language mode |
| P1 | Marketplace proof | README and Marketplace screenshots for OFMarkdown-specific features |
| P2 | Status/config | Rich status tooltip, quick actions, and client-side toggles |
| P2 | Editor contributions | Snippets, language configuration, scoped keybindings |
| P2 | Remote/trust | WSL/SSH/dev-container verification and clear disabled states |
| P2 | Membership refresh | Recheck/revert language mode after workspace and index changes |
| P3 | Troubleshooting | Copy diagnostic info and troubleshooting command/docs |
| P3 | Views | Optional vault health/backlinks/outlinks views |
| P3 | Compatibility | Client/server version checks and extension-host packaged smoke tests |

## Recommendation

Treat the extension parity milestone separately from server parity:

1. Make activation and language-mode behavior precise.
2. Add VS Code command bridges for the places where native VS Code UI is better
   than raw LSP output.
3. Add real extension-host tests before adding more client behavior.
4. Improve Marketplace proof so users can see OFMarkdown value before install.

After that, Flavor Grenade's VS Code extension is not just at Marksman parity.
It becomes the editor-specific OFMarkdown layer that Marksman intentionally is
not.

## Sources

| Source | URL |
|---|---|
| Marksman VSCode repository | https://github.com/artempyanykh/marksman-vscode |
| Marksman VSCode package manifest | https://raw.githubusercontent.com/artempyanykh/marksman-vscode/main/package.json |
| Marksman VSCode extension source | https://raw.githubusercontent.com/artempyanykh/marksman-vscode/main/src/extension.ts |
| Marksman VSCode README | https://raw.githubusercontent.com/artempyanykh/marksman-vscode/main/README.md |
| Marksman VS Code Marketplace listing | https://marketplace.visualstudio.com/items?itemName=arr.marksman |
| Flavor Grenade extension design | [[docs/superpowers/specs/2026-04-21-vscode-extension-design]] |
| Flavor Grenade editor client model | [[docs/ddd/editor-client/domain-model]] |
| Flavor Grenade OFMarkdown language mode | [[docs/features/ofmarkdown-language-mode]] |
| Flavor Grenade extension README | `extension/README.md` |
