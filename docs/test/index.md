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

---

## Integration Tests

Integration tests live under `tests/integration/`. They test behaviour across multiple modules or against a real filesystem fixture.

*No integration tests exist yet. The first integration tests are introduced in Phase 4 (Vault Index).*

---

## BDD Scenarios

BDD step definitions live under `tests/bdd/steps/`. Each step file implements the Gherkin scenarios from the corresponding `docs/bdd/features/*.feature` file.

*No BDD step implementations exist yet. BDD step stubs are introduced in Phase 3 (OFM Parser).*

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
