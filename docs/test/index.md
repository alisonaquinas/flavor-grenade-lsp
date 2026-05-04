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

---

## Integration Tests

Integration tests live under `tests/integration/`. They test behaviour across multiple modules or against a real filesystem fixture.

*No integration tests exist yet. The first integration tests are introduced in Phase 4 (Vault Index).*

---

## BDD Scenarios

BDD step definitions live under `tests/bdd/steps/`. Each step file implements the Gherkin scenarios from the corresponding `docs/bdd/features/*.feature` file.

*No BDD step implementations exist yet. BDD step stubs are introduced in Phase 3 (OFM Parser).*

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
| `extension/src/language-mode.test.ts` | Unit | Tests OFMarkdown promotion rules, `.obsidian` fast-path detection, manual mode preservation, server membership requests, and in-flight assignment guard | `Extension.LanguageMode.Contribution`, `Extension.LanguageMode.DynamicAssignment`, `Extension.LanguageMode.NonVaultIsolation`, `Extension.LanguageMode.UserOverrideSafety`, `Extension.LanguageMode.LoopSafety` | Phase E6 | ✅ implemented |
| `extension/src/__tests__/server-path.test.ts` | Unit | Tests 2-tier binary resolution: user setting override, bundled path, Windows .exe suffix | `Extension.Binary.Resolution` | Phase E2 | 📋 planned |
| `extension/src/__tests__/status-bar.test.ts` | Unit | Tests StatusBarItem text/tooltip transitions for all 4 flavorGrenade/status states | `Extension.StatusBar.StateTransition` | Phase E3 | 📋 planned |
| `extension/src/__tests__/commands.test.ts` | Unit | Tests command registration and that each command calls the correct LanguageClient method | `Extension.Commands.Registration` | Phase E3 | 📋 planned |

### Extension Integration Tests

Extension integration tests require the VS Code Extension Development Host launched via `@vscode/test-electron`.

> [!NOTE] Aspirational
> The test files listed below do not exist yet. They require `@vscode/test-electron` infrastructure to be established. See FEAT-016 retrospective carry-forward actions.

| Test File | Type | Description | Requirements Tags | Phase | Status |
|---|---|---|---|---|---|
| `extension/src/__tests__/activation.test.ts` | Integration | Tests extension activates on markdown file open, LanguageClient starts, server handshake completes | `Extension.Activation.Markdown` | Phase E2 | 📋 planned |
| `extension/src/__tests__/lifecycle.test.ts` | Integration | Tests clean deactivation, config change restart, crash recovery | `Extension.Lifecycle.Restart` | Phase E3 | 📋 planned |

### Extension BDD Scenarios

> [!NOTE] Aspirational
> The step definition file listed below does not exist yet. The feature file contains scenarios but no step implementations.

| Feature File | Step File | Description | Phase | Status |
|---|---|---|---|---|
| `docs/bdd/features/vscode-extension.feature` | `extension/src/__tests__/bdd/vscode-extension.steps.ts` | 11 acceptance scenarios covering activation, status bar, commands, binary resolution, crash recovery | Phase E4 | 📋 planned |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | `extension/src/__tests__/bdd/ofmarkdown-language-mode.steps.ts` | 6 acceptance scenarios covering dynamic OFMarkdown assignment and Markdown/manual mode preservation | Phase E6 | 📋 planned |

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
