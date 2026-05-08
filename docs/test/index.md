---
title: Test Index
tags:
  - test/index
aliases:
  - Test Inventory
  - Test File Index
---

# Test Index

This file is the authoritative inventory of all test files in the `tests/` directory. It is organized by test type and maps each file to its description, the Planguage requirement tags it exercises, and the phase in which it was introduced.

> [!NOTE] Maintenance
> This file is updated automatically by `scripts/update-test-index.sh` (stub in Phase 1; fully implemented in Phase 3). Until the script is implemented, update this file manually whenever a new test file is added to `tests/`. Always commit index updates in the same commit as the test file that triggered them.

> [!TIP]
> For the full requirements × tests × work-performed traceability matrix, see [[test/matrix]].

---

## How to Read This Index

| Column | Meaning |
|---|---|
| **Test File** | Path relative to the repository root |
| **Type** | `Unit`, `Integration`, or `BDD` |
| **Description** | What the test exercises in one sentence |
| **Requirements Tags** | Planguage `Tag` fields from `docs/requirements/` that this test provides evidence for |
| **Phase** | The plan phase in which this test was first introduced |

---

## Unit Tests

Unit tests live under `tests/unit/` and mirror the `src/` module structure. Each unit test file exercises exactly one class or module in isolation.

| Test File | Type | Description | Requirements Tags | Phase |
|---|---|---|---|---|
| `tests/unit/lsp/lsp.module.spec.ts` | Unit | NestJS module graph smoke test — verifies `LspModule` compiles and can be resolved from the application context | `Workspace.VaultDetection.Primary` | Phase 1 |
| `src/vault/__tests__/document-membership.test.ts` | Unit | Tests server-side `flavorGrenade/documentMembership` results for Obsidian vaults, Flavor Grenade config vaults, indexed docs, single-file mode, and unsupported URI schemes | `Extension.LanguageMode.DynamicAssignment`, `Extension.LanguageMode.NonVaultIsolation` | Phase E6 |
| `src/vault/__tests__/vault.module.test.ts` | Unit | Verifies `VaultModule` registers `flavorGrenade/documentMembership` with the JSON-RPC dispatcher | `Extension.LanguageMode.DynamicAssignment` | Phase E6 |
| `src/vault/__tests__/vault-scanner.test.ts` | Unit | Tests configured document-extension filtering for vault scans | `Workspace.FileExtension.Filter` | Phase 14 |
| `src/parser/__tests__/frontmatter-parser.test.ts` | Unit | Tests frontmatter parsing, malformed YAML handling, and security limits for frontmatter size and YAML aliases | `Security.Parser.YAMLLimits` | Phase 18 |
| `src/parser/__tests__/markdown-link-parser.test.ts` | Unit | Tests inline Markdown links, image links, reference labels, definitions, and opaque-region suppression | `Parity.MarkdownLinks.ParseCoverage` | Phase 14 |
| `src/parser/__tests__/ofm-parser.integration.test.ts` | Unit | Verifies OFM parser integration includes Markdown link and label indexes alongside existing OFM constructs | `Parity.MarkdownLinks.ParseCoverage` | Phase 14 |
| `src/resolution/__tests__/markdown-target-classifier.test.ts` | Unit | Tests Markdown target classification for local docs, attachments, fragments, external URLs, unsupported schemes, and traversal underflow | `Parity.MarkdownLinks.TargetClassification`, `Security.Vault.PathConfinement` | Phase 14 |
| `src/resolution/__tests__/ref-graph-markdown-links.test.ts` | Unit | Tests RefGraph indexing for Markdown document refs, standalone link definitions, image refs, label refs, and external URL suppression | `Parity.MarkdownLinks.ReferenceGraph`, `Parity.MarkdownLinks.LocalResolution` | Phase 14 |
| `src/resolution/__tests__/markdown-link-oracle.test.ts` | Unit | Tests Markdown document and heading resolution, same-document fragments, ambiguous headings, and malformed percent escape safety | `Parity.MarkdownLinks.LocalResolution`, `Parity.MarkdownLinks.SameDocumentAnchor`, `Parity.HeadingAmbiguity.Diagnostics` | Phase 14 |
| `src/resolution/__tests__/markdown-link-diagnostics.test.ts` | Unit | Tests external URL diagnostic suppression and missing or ambiguous Markdown heading anchor diagnostics | `Parity.MarkdownLinks.SameDocumentAnchor`, `Parity.HeadingAmbiguity.Diagnostics` | Phase 14 |
| `src/handlers/__tests__/markdown-link-navigation.test.ts` | Unit | Tests Markdown link definition and references for inline file links, same-document anchors, and label definitions | `Navigation.Definition.AllLinkTypes`, `Navigation.References.Completeness`, `Parity.MarkdownLinks.NavigationAndReferences` | Phase 14 |
| `src/handlers/__tests__/markdown-heading-rename.test.ts` | Unit | Tests heading rename updates same-document and file-plus-heading Markdown anchors | `Rename.Refactoring.Completeness`, `Parity.MarkdownLinks.RenameAnchors` | Phase 14 |
| `src/completion/__tests__/context-analyzer.test.ts` | Unit | Tests Markdown link URL and heading completion contexts before tag detection | `Completion.Trigger.Coverage`, `Parity.MarkdownLinks.Completion` | Phase 14 |
| `src/completion/__tests__/completion-router.test.ts` | Unit | Tests Markdown document and heading completion routing, external URL suppression, nested source path relativity, and attachment completion ranking | `Completion.Trigger.Coverage`, `Parity.MarkdownLinks.Completion`, `Parity.Attachments.Completion`, `Parity.Attachments.ConfigHints` | Phase 14 |
| `src/vault/__tests__/attachment-config.test.ts` | Unit | Tests Obsidian `.obsidian/app.json` attachment folder discovery and malformed-config fallback | `Parity.Attachments.ConfigHints`, `Parity.Attachments.Intelligence` | Phase 15 |
| `src/resolution/__tests__/attachment-diagnostics.test.ts` | Unit | Tests missing and existing attachment diagnostics for Markdown image links and embeds | `Parity.Attachments.Diagnostics`, `Diagnostic.Severity.Embed`, `Embed.Resolution.ImageTarget` | Phase 15 |
| `src/handlers/__tests__/attachment-navigation.test.ts` | Unit | Tests definition targets for Markdown image and embed attachments use indexed attachment URIs | `Parity.Attachments.NavigationHover`, `Navigation.Definition.AllLinkTypes` | Phase 15 |
| `src/handlers/__tests__/attachment-hover.test.ts` | Unit | Tests lightweight attachment hover metadata for Markdown image and embed attachments | `Parity.Attachments.NavigationHover`, `HV-002` | Phase 15 |
| `src/lsp/lsp.module.test.ts` | Unit | Tests file-operation capability advertisement and LSP handler registration | `Parity.FileOperations.CapabilityRegistration` | Phase 16 |
| `src/lsp/handlers/__tests__/file-operations.handler.test.ts` | Unit | Tests will/did rename file-operation routing, detected vault-root confinement, rejected plans, and refresh invocation | `Parity.FileOperations.AtomicRefactor`, `Parity.FileOperations.CapabilityRegistration`, `Security.Vault.PathConfinement`, `Security.Vault.RenameConfinement` | Phase 16 |
| `src/lsp/handlers/__tests__/file-operation-refresh.service.test.ts` | Unit | Tests post-rename index, folder lookup, tag registry, reference graph, and diagnostic refresh | `Parity.FileOperations.IndexRefresh` | Phase 16 |
| `src/vault/__tests__/file-operation-planner.test.ts` | Unit | Tests vault-confined note, attachment, and folder move planning with escaping path rejection | `Parity.FileOperations.MovePlannerConfinement`, `Security.Vault.PathConfinement`, `Security.Vault.RenameConfinement` | Phase 16 |
| `src/resolution/__tests__/file-operation-rewriter.test.ts` | Unit | Tests syntax-preserving rewrites for moved document and attachment references | `Parity.FileOperations.ReferenceRewrite`, `Rename.Refactoring.Completeness` | Phase 16 |
| `src/resolution/__tests__/workspace-edit-validator.test.ts` | Unit | Tests all-or-nothing WorkspaceEdit validation, overlap rejection, deterministic ordering, and skipped-reference preservation | `Parity.FileOperations.AtomicValidation`, `Parity.FileOperations.SkippedAmbiguousReporting` | Phase 16 |
| `src/resolution/__tests__/file-operation-regression.test.ts` | Unit | Tests the nested vault-relative Markdown image rewrite regression discovered during Phase 16 | `Parity.FileOperations.ReferenceRewrite`, `Parity.FileOperations.AtomicRefactor` | Phase 16 |
| `src/handlers/__tests__/document-link.handler.test.ts` | Unit | Tests structural document links for unambiguous wiki, Markdown, reference-style, and attachment targets plus ambiguous/external suppression | `Parity.StructuralLSP.DocumentLinks`, `Parity.StructuralLSP.Coverage`, `Navigation.Definition.AllLinkTypes` | Phase 17 |
| `src/handlers/__tests__/folding-range.handler.test.ts` | Unit | Tests structural folding ranges for frontmatter, headings, callouts, opaque code, math, comments, and Templater regions | `Parity.StructuralLSP.FoldingRanges`, `Parity.StructuralLSP.Coverage`, `ST-002` | Phase 17 |
| `src/handlers/__tests__/selection-range.handler.test.ts` | Unit | Tests structural selection ranges, invalid-position rejection, opaque Templater boundaries, and CRLF offset handling | `Parity.StructuralLSP.SelectionRanges`, `Parity.StructuralLSP.Coverage`, `Security.Input.PositionValidation`, `ST-002` | Phase 17 |
| `src/lsp/handlers/__tests__/initialize.handler.test.ts` | Unit | Tests `initialize` rejects non-file root URIs before lifecycle state mutation | `Security.Vault.URISchemeAllowlist` | Phase 18 |
| `src/lsp/handlers/__tests__/initialized.handler.test.ts` | Unit | Tests `initialized` rejects non-file root URIs before vault scan starts | `Security.Vault.URISchemeAllowlist` | Phase 18 |

---

## Integration Tests

Integration tests live under `src/test/integration/`. They test behaviour across
multiple modules or against a real filesystem fixture.

| Test File | Type | Description | Requirements Tags | Phase |
|---|---|---|---|---|
| `src/test/integration/transport.test.ts` | Integration | Tests real stdio LSP handshake, status notification, unknown-method response, shutdown, and exit | `Parity.FileOperations.CapabilityRegistration` | Phase 16 |
| `src/test/integration/navigation.test.ts` | Integration | Tests definition, references, and CodeLens through a spawned LSP server | `Navigation.Definition.AllLinkTypes`, `Navigation.References.Completeness`, `Navigation.CodeLens.Count` | Phase 10 |
| `src/test/integration/rename.test.ts` | Integration | Tests prepare-rename and rename behavior through a spawned LSP server | `Rename.Refactoring.Completeness`, `Rename.Prepare.Rejection` | Phase 11 |
| `src/test/integration/wiki-links.test.ts` | Integration | Tests wiki-link diagnostics, definition, and completion through a spawned LSP server | `Diagnostic.Severity.WikiLink`, `Navigation.Definition.AllLinkTypes`, `Completion.Trigger.Coverage` | Phase 5 |
| `src/test/integration/structural-lsp.test.ts` | Integration | Tests document links, folding ranges, and selection ranges through a spawned LSP server | `Parity.StructuralLSP.Coverage`, `Parity.StructuralLSP.DocumentLinks`, `Parity.StructuralLSP.FoldingRanges`, `Parity.StructuralLSP.SelectionRanges`, `ST-002` | Phase 17 |

---

## BDD Scenarios

BDD step definitions live under `tests/bdd/steps/`. Each step file implements the Gherkin scenarios from the corresponding `docs/bdd/features/*.feature` file.

| Step File | Feature File | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `src/test/bdd/step-definitions/ofmarkdown-parity.steps.ts` | `docs/bdd/features/ofmarkdown-parity.feature` | Tests the structural LSP parity scenario for document links, folding ranges, and selection ranges | `Parity.StructuralLSP.Coverage`, `Parity.StructuralLSP.DocumentLinks`, `Parity.StructuralLSP.FoldingRanges`, `Parity.StructuralLSP.SelectionRanges` | Phase 17 | ✅ implemented |

---

## Extension Tests

Extension tests live under `extension/src/` and use a separate test
infrastructure from the server's Bun-based tests. Pure extension unit tests run
with Node's test runner and `tsx`; VS Code API integration tests run inside the
Extension Development Host through `@vscode/test-electron`.

> [!NOTE] Test Runner
> `npm test` runs pure extension tests from `extension/`. `npm run test:host`
> launches VS Code and runs all host fixtures: `.obsidian/`,
> `.flavor-grenade.toml`, and generic Markdown.

### Extension Unit Tests

Extension unit tests exercise extension-side logic only, usually through pure
helpers or injected VS Code facades.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/language-mode.test.ts` | Unit | Tests OFMarkdown contribution metadata, Markdown grammar/configuration parity, promotion rules, `.obsidian` fast-path detection, manual mode preservation, server membership requests, refresh coverage, guarded downgrade, and in-flight assignment guard | `Extension.LanguageMode.Contribution`, `Extension.LanguageMode.DynamicAssignment`, `Extension.LanguageMode.NonVaultIsolation`, `Extension.LanguageMode.UserOverrideSafety`, `Extension.LanguageMode.LoopSafety`, `Extension.LanguageMode.MarkdownParity`, `Extension.LanguageMode.MembershipRefresh` | Phase E6, Phase E14 | ✅ implemented |
| `extension/src/activation-gate.test.ts` | Unit | Tests activation manifest events, vault-marker detection, generic Markdown idle startup, OFMarkdown language wake, and explicit command wake decisions | `Extension.Activation.Markdown`, `Extension.Activation.VaultPrecision`, `Extension.Activation.MarkerEvents` | Phase E7 | ✅ implemented |
| `extension/src/command-bridges.test.ts` | Unit | Tests command bridge manifest events, native reference and link bridge calls, payload validation, graph action bridges, vault reveal, and diagnostic copy behavior | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.CommandBridges.GraphActions` | Phase E8 | ✅ implemented |
| `extension/src/server-command.test.ts` | Unit | Tests 2-tier binary resolution: user setting override, bundled path, Windows `.exe` suffix | `Extension.Binary.Resolution`, `Extension.Binary.PlatformSuffix` | Phase E2 | ✅ implemented |
| `extension/src/status-bar.test.ts` | Unit | Tests status text, rich tooltip detail, disabled/crashed/misconfigured states, quick actions, and sanitized diagnostic text | `Extension.StatusBar.StateTransition`, `Extension.Status.Diagnostics`, `Extension.Status.QuickActions` | Phase E10 | ✅ implemented |
| `extension/src/status-actions.test.ts` | Unit | Tests status quick-pick action item creation for restart, rebuild, output, diagnostic copy, and vault reveal actions | `Extension.Status.QuickActions` | Phase E10 | ✅ implemented |
| `extension/src/troubleshooting.test.ts` | Unit | Tests the troubleshooting document URL and required recovery topics | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions` | Phase E10 | ✅ implemented |
| `extension/src/workspace-environment.test.ts` | Unit | Tests Restricted Mode, virtual workspace, local, and remote workspace environment classification | `Extension.Workspace.EnvironmentModes`, `Extension.Status.Diagnostics` | Phase E13 | ✅ implemented |
| `extension/test/marketplace/readme-assets.test.ts` | Unit | Tests Marketplace README references every required OFMarkdown visual with supported local image formats | `Extension.Marketplace.OFMProof`, `Extension.Marketplace.AssetPackaging` | Phase E11 | ✅ implemented |
| `extension/test/marketplace/vsix-assets.test.ts` | Unit | Tests the Marketplace asset verification script and packaged output include every required README visual | `Extension.Marketplace.AssetPackaging` | Phase E11 | ✅ implemented |
| `extension/test/package-targets/server-binary.test.ts` | Unit | Tests package-target server binary mapping, wrong/missing/duplicate binary rejection, and real VSIX archive inspection | `Extension.Packaging.TargetBinaryValidation` | Phase E14 | ✅ implemented |
| `extension/test/contributions/snippets.test.ts` | Unit | Tests OFMarkdown-only snippet contribution scope and required snippet prefixes | `Extension.Contributions.OFMarkdownScoped` | Phase E12 | ✅ implemented |
| `extension/test/contributions/language-configuration.test.ts` | Unit | Tests OFMarkdown language configuration scope, auto-pairs, surrounding pairs, and word pattern tuning | `Extension.Contributions.OFMarkdownScoped` | Phase E12 | ✅ implemented |
| `extension/test/contributions/keybindings.test.ts` | Unit | Tests OFMarkdown-scoped keybindings target payload-free commands and include language guards | `Extension.Contributions.OFMarkdownScoped` | Phase E12 | ✅ implemented |
| `extension/test/contributions/ofmarkdown-isolation.test.ts` | Unit | Tests generic Markdown does not receive OFMarkdown-only snippets, keybindings, or language configuration | `Extension.Contributions.OFMarkdownScoped` | Phase E12 | ✅ implemented |
| `extension/src/__tests__/commands.test.ts` | Unit | Tests command registration and that each command calls the correct LanguageClient method | `Extension.Commands.Registration` | Phase E3 | 📋 planned |

### Extension Integration Tests

Extension integration tests require the VS Code Extension Development Host launched via `@vscode/test-electron`.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/test/suite/index.js` | Host runner | Runs all extension-host suites inside isolated temp copies of the fixture workspaces | `Extension.Tests.HostCoverage` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/extension-host.test.js` | Integration | Verifies the development host loads Flavor Grenade and registers lifecycle plus bridge commands | `Extension.Tests.HostCoverage`, `Extension.Commands.Registration` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/activation-language-mode.test.js` | Integration | Tests vault startup, `.flavor-grenade.toml` startup, generic Markdown idle behavior, OFMarkdown promotion, and manual non-Markdown preservation | `Extension.Activation.VaultPrecision`, `Extension.LanguageMode.MembershipRefresh`, `Extension.Tests.HostCoverage` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/command-bridges.test.js` | Integration | Tests native bridge commands with valid payloads and invalid payload rejection in the VS Code host | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.Tests.HostCoverage` | Phase E9 | ✅ implemented |
| `extension/src/test/suite/status-failure.test.js` | Integration | Tests troubleshooting command/settings visibility, development-host status presentation transitions, quick actions, and diagnostic copy text | `Extension.Status.Diagnostics`, `Extension.Status.QuickActions`, `Extension.Tests.HostCoverage` | Phase E10 | ✅ implemented |
| `extension/docs/features/workspace-environments.md` | Manual | Documents local Windows, macOS, Linux, WSL, SSH, Dev Container, Restricted Mode, and virtual workspace smoke checks | `Extension.Workspace.EnvironmentModes`, `Extension.Status.Diagnostics` | Phase E13 | ✅ implemented |
| `extension/src/__tests__/lifecycle.test.ts` | Integration | Tests clean deactivation, config change restart, crash recovery | `Extension.Lifecycle.Restart` | Phase E3 | 📋 planned |

### Extension BDD Scenarios

> [!NOTE] Aspirational
> The step definition file listed below does not exist yet. The feature file contains scenarios but no step implementations.

| Feature File | Step File | Description | Phase | Status |
|---|---|---|---|---|
| `docs/bdd/features/vscode-extension.feature` | `extension/src/__tests__/bdd/vscode-extension.steps.ts` | 11 acceptance scenarios covering activation, status bar, commands, binary resolution, crash recovery | Phase E4 | 📋 planned |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `extension/src/__tests__/bdd/ofmarkdown-language-mode.steps.ts` | 6 acceptance scenarios covering dynamic OFMarkdown assignment and Markdown/manual mode preservation | Phase E6 | 📋 specified; extension-host step implementation deferred to Phase E9 |

---

## Fixture Vaults

Test fixture vaults live under `tests/fixtures/vaults/`. Each subdirectory is a minimal vault structure used by integration and BDD tests.

| Fixture | Description | First Used |
|---|---|---|
| `tests/fixtures/vaults/empty/` | An empty vault directory (`.gitkeep` only) — used to verify vault detection boundary conditions | Phase 1 |

---

## Adding a New Test

When you add a new test file:

1. Add the file to this index in the appropriate section.
2. Add a row to [[test/matrix]] mapping the new test to its Planguage requirement tags.
3. Commit both the test file and the updated index/matrix in the same commit.
4. Run `scripts/update-test-index.sh` if available to auto-populate (Phase 3+).

> [!WARNING]
> A test file that exists in `tests/` but does not appear in this index is an index maintenance violation (see [[requirements/development-process#Process.TestIndex.Matrix]]). The matrix entry must exist before the PR is merged.

---

## Related Documents

- [[test/matrix]] — Planguage requirements × test files × status traceability matrix
- [[requirements/index]] — Master Planguage tag index (source of truth for tag names)
- [[requirements/development-process#Process.Testing.DirectoryStructure]] — Test file location policy
- [[requirements/development-process#Process.TestIndex.Matrix]] — Matrix maintenance requirement
- [[plans/phase-01-scaffold]] — Phase 1 task list where first tests are introduced
