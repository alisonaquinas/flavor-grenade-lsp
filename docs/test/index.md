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

Extension tests live under `extension/src/__tests__/` and use a separate test infrastructure from the server's Bun-based tests. Because extension code runs inside the VS Code extension host (a Node.js process with the `vscode` API available), extension tests require `@vscode/test-electron` and `@vscode/test-cli` rather than Bun test.

> [!NOTE] Test Runner
> Extension unit tests mock the VS Code API and can run without launching VS Code. Extension integration tests require the Extension Development Host launched via `@vscode/test-electron`. Both use the `@vscode/test-cli` runner. See the extension `package.json` `test` script for configuration.

### Extension Unit Tests

Extension unit tests exercise extension-side logic only, mocking the VS Code API.

> [!NOTE] Aspirational
> The test files listed below do not exist yet. They represent the target test coverage once a VS Code API mock strategy is established. See FEAT-016 retrospective carry-forward actions.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/language-mode.test.ts` | Unit | Tests OFMarkdown contribution metadata, Markdown grammar/configuration parity, promotion rules, `.obsidian` fast-path detection, manual mode preservation, server membership requests, and in-flight assignment guard | `Extension.LanguageMode.Contribution`, `Extension.LanguageMode.DynamicAssignment`, `Extension.LanguageMode.NonVaultIsolation`, `Extension.LanguageMode.UserOverrideSafety`, `Extension.LanguageMode.LoopSafety`, `Extension.LanguageMode.MarkdownParity` | Phase E6 | ✅ implemented |
| `extension/src/activation-gate.test.ts` | Unit | Tests activation manifest events, vault-marker detection, generic Markdown idle startup, OFMarkdown language wake, and explicit command wake decisions | `Extension.Activation.Markdown`, `Extension.Activation.VaultPrecision`, `Extension.Activation.MarkerEvents` | Phase E7 | ✅ implemented |
| `extension/src/command-bridges.test.ts` | Unit | Tests command bridge manifest events, native reference and link bridge calls, payload validation, graph action bridges, vault reveal, and diagnostic copy behavior | `Extension.CommandBridges.NativeUI`, `Extension.CommandBridges.PayloadValidation`, `Extension.CommandBridges.GraphActions` | Phase E8 | ✅ implemented |
| `extension/src/__tests__/server-path.test.ts` | Unit | Tests 2-tier binary resolution: user setting override, bundled path, Windows .exe suffix | `Extension.Binary.Resolution` | Phase E2 | 📋 planned |
| `extension/src/__tests__/status-bar.test.ts` | Unit | Tests StatusBarItem text/tooltip transitions for all 4 flavorGrenade/status states | `Extension.StatusBar.StateTransition` | Phase E3 | 📋 planned |
| `extension/src/__tests__/commands.test.ts` | Unit | Tests command registration and that each command calls the correct LanguageClient method | `Extension.Commands.Registration` | Phase E3 | 📋 planned |

### Extension Integration Tests

Extension integration tests require the VS Code Extension Development Host launched via `@vscode/test-electron`.

> [!NOTE] Aspirational
> The test files listed below do not exist yet. They require `@vscode/test-electron` infrastructure to be established. See FEAT-016 retrospective carry-forward actions.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/__tests__/activation.test.ts` | Integration | Tests Markdown activation runs the startup gate and starts the LanguageClient only after a positive vault, OFMarkdown, or command signal | `Extension.Activation.Markdown`, `Extension.Activation.VaultPrecision` | Phase E9 | 📋 planned |
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
