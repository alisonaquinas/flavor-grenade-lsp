---
title: Unit Test Plans — Index
tags: [test/unit, test/tdd, test/index]
aliases: [Unit Test Index, TDD Unit Plans]
---

# Unit Test Plans — Index

> [!INFO] Unit test plans are TDD planning documents. Each entry (`TC-UNIT-MODULE-NNN`) specifies the **RED failing test** to write before implementation, and the **GREEN condition** that implementation must satisfy. No `src/` code exists yet — these plans drive Phase 1+ implementation in strict RED → GREEN → REFACTOR order.

Plans are organized by NestJS module layer (bottom → top). See [[architecture/layers]] for the full dependency order. See [[adr/ADR010-tests-directory-structure]] for the `tests/unit/` mirroring convention.

---

## Unit Plan Catalog

| File | Module / Layer | TC Prefix | # TC-UNIT Entries | Spec Path Prefix |
|---|---|---|---|---|
| [[tests/unit/unit-path-module]] | PathModule — Foundation | `TC-UNIT-PATH` | 18 | `tests/unit/path/` |
| [[tests/unit/unit-config-module]] | ConfigModule — Config | `TC-UNIT-CFG` | 12 | `tests/unit/config/` |
| [[tests/unit/unit-parser-pipeline]] | ParserModule — Pipeline | `TC-UNIT-PARSE` | 12 | `tests/unit/parser/` |
| [[tests/unit/unit-parser-elements]] | ParserModule — Elements | `TC-UNIT-ELEM` | 21 | `tests/unit/parser/` |
| [[tests/unit/unit-document-module]] | DocumentModule | `TC-UNIT-DOC` | 12 | `tests/unit/document/` |
| [[tests/unit/unit-vault-module]] | VaultModule | `TC-UNIT-VAULT` | 15 | `tests/unit/vault/` |
| [[tests/unit/unit-resolution-module]] | ReferenceModule | `TC-UNIT-RES` | 16 | `tests/unit/resolution/` |
| [[tests/unit/unit-features-diagnostics]] | DiagnosticService | `TC-UNIT-DIAG` | 11 | `tests/unit/features/` |
| [[tests/unit/unit-features-completions]] | CompletionService | `TC-UNIT-COMP` | 12 | `tests/unit/features/` |
| [[tests/unit/unit-features-navigation-rename]] | DefinitionService · ReferencesService · RenameService | `TC-UNIT-NAV` | 12 | `tests/unit/features/` |
| [[tests/unit/unit-lsp-module]] | LspModule — RequestRouter · CapabilityNegotiator | `TC-UNIT-LSP` | 11 | `tests/unit/lsp/` |

Total: 152 TC-UNIT entries across 11 plans

---

## ID Scheme

`TC-UNIT-<MODULE>-NNN` — numbers are local to each plan (001, 002, …).

| Prefix | Module |
|---|---|
| `TC-UNIT-PATH` | PathModule value types |
| `TC-UNIT-CFG` | ConfigModule (TomlLoader, ConfigCascade, FlavorConfig) |
| `TC-UNIT-PARSE` | OFMParser 8-stage pipeline |
| `TC-UNIT-ELEM` | Parser sub-elements (WikiLink, Embed, BlockAnchor, Tag, Callout) |
| `TC-UNIT-DOC` | DocumentModule (OFMDoc, TextChangeApplicator, DocLifecycle) |
| `TC-UNIT-VAULT` | VaultModule (VaultDetector, FolderLookup, VaultFolder, Workspace) |
| `TC-UNIT-RES` | ReferenceModule (SymbolExtractor, RefGraph, Oracle) |
| `TC-UNIT-DIAG` | DiagnosticService |
| `TC-UNIT-COMP` | CompletionService |
| `TC-UNIT-NAV` | DefinitionService, ReferencesService, RenameService |
| `TC-UNIT-LSP` | RequestRouter, CapabilityNegotiator |

---

## Plans by Module Layer

```
LSP Layer         unit-lsp-module            TC-UNIT-LSP   (11 cases)
Feature Layer     unit-features-diagnostics  TC-UNIT-DIAG  (11 cases)
                  unit-features-completions  TC-UNIT-COMP  (12 cases)
                  unit-features-nav-rename   TC-UNIT-NAV   (12 cases)
Resolution Layer  unit-resolution-module     TC-UNIT-RES   (16 cases)
Vault Layer       unit-vault-module          TC-UNIT-VAULT (15 cases)
Document Layer    unit-document-module       TC-UNIT-DOC   (12 cases)
Parser Layer      unit-parser-pipeline       TC-UNIT-PARSE (12 cases)
                  unit-parser-elements       TC-UNIT-ELEM  (21 cases)
Config Layer      unit-config-module         TC-UNIT-CFG   (12 cases)
Foundation Layer  unit-path-module           TC-UNIT-PATH  (18 cases)
```

---

## TDD Discipline

> [!WARNING] RED before GREEN is non-negotiable. Per [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`: the failing test commit must precede the implementation commit in git history with no exceptions. See [[templates/tickets/lifecycle/task-lifecycle]] for the state machine.

**Phase sequence for each TC-UNIT entry:**

1. **RED commit** — write the test from the plan; run `bun test`; confirm it fails for the right reason (not a syntax error)
2. **GREEN commit** — write the minimal implementation that makes the test pass; run `bun test`; confirm all prior tests still pass
3. **REFACTOR** (optional) — clean up; tests remain green; commit separately

**Running unit tests:**

```bash
# All unit tests
bun test tests/unit/

# Single module
bun test tests/unit/parser/

# Single spec file
bun test tests/unit/parser/ofm-parser.service.spec.ts

# With type-check
tsc --noEmit && bun test tests/unit/
```

---

## Mock Strategy

| Module under test | What to mock |
|---|---|
| PathModule | Nothing — pure synchronous functions |
| ConfigModule (TomlLoader) | `TomlReader` interface (in-memory TOML strings, no disk I/O) |
| ParserModule | Nothing — pure parse functions |
| DocumentModule | `OFMParser` (via NestJS test module stub) |
| VaultModule (VaultDetector) | `Fs` interface — `MockFs.fromTree(entries)` |
| VaultModule (FolderLookup) | `FolderLookup.fromEntries(slugPathPairs)` directly |
| ReferenceModule | Synthetic `OFMIndex` values; no parser needed |
| Feature services | `Oracle` mock, `VaultIndex` mock, `FlavorConfig` defaults |
| LspModule (RequestRouter) | Handler functions as jest/bun mocks |

---

## Related Indexes

- [[tests/integration/index]] — E2E smoke plans (TC-SMOKE-*)
- [[tests/verification/index]] — FR-level verification plans (TC-VER-*)
- [[tests/validation/index]] — User-level validation plans (TC-VAL-*)
- [[test/matrix]] — Pass/fail tracking for all test files
- [[test/index]] — Master list of all test files in the suite
