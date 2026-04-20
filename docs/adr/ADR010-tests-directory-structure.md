---
adr: "010"
title: Separate tests/ root directory instead of co-located __tests__
status: accepted
date: 2026-04-16
---

# ADR 010 — Separate `tests/` root directory instead of co-located `__tests__`

## Context

TypeScript projects organise test files in one of two conventional ways.

**Pattern 1 — Co-located `__tests__/`.** Test files live next to the source files they test, typically in a `__tests__/` sibling directory within the same module directory. For example: `src/lsp/__tests__/lsp.server.spec.ts`. This pattern is standard in Jest-heavy JavaScript projects and is recommended by the Jest documentation. The advantage is proximity: opening `lsp.server.ts` and its test file requires navigating within the same directory tree. The disadvantage is that `src/` becomes a mix of production code and test infrastructure. Build tools must be configured to exclude `__tests__/` from the compiled output. Fixtures and shared test helpers have no natural home and end up scattered across the source tree or collected in a top-level `__mocks__/` directory by convention.

**Pattern 2 — Separate `tests/` root.** Test files live in a dedicated top-level `tests/` directory that mirrors the structure of `src/`. For example: `tests/unit/lsp/lsp.server.spec.ts` corresponds to `src/lsp/lsp.server.ts`. The `src/` tree contains only production code. `tests/` contains the full test infrastructure: unit tests, integration tests, BDD step definitions, fixtures, and shared helpers. Build configuration for production code never needs to reference `tests/`. Test runner configuration points `tests/` as the root.

The project also requires "index tests in /docs/test" with a requirement matrix linking test files to requirements. A separate `tests/` root makes this indexing clean: `docs/test/` can enumerate paths under `tests/` without any source file noise from `src/`.

The OFM parser (see [[plans/phase-03-ofm-parser]]) will require a significant set of fixture vaults — real or synthetic OFM files that exercise specific parsing rules. These fixtures are test-only artefacts and should not live inside `src/`.

The BDD layer (see [[design/behavior-layer]]) requires Cucumber step definition files that wire Gherkin scenarios to TypeScript code. Step files are not source modules and should not be importable as production dependencies.

## Decision

Use a **separate `tests/` root directory** mirroring `src/`.

Top-level structure:

```text
tests/
├── unit/            # unit tests — mirror src/ structure exactly
│   ├── lsp/
│   ├── parser/
│   ├── vault/
│   └── ...
├── integration/     # multi-module integration tests
├── bdd/             # Cucumber/Gherkin step implementations
│   └── steps/
├── fixtures/        # test vault fixtures (sample OFM files)
│   └── vaults/
└── helpers/         # shared test utilities and factory functions
```

Mapping convention: `tests/unit/<module>/<file>.spec.ts` tests `src/<module>/<file>.ts`. The names are kept in sync. If `src/parser/ofm-parser.service.ts` exists, its unit test lives at `tests/unit/parser/ofm-parser.service.spec.ts`.

TypeScript configuration: a `tsconfig.test.json` at the repository root extends the root `tsconfig.json` and adds `tests/**/*` to `include`. Production `tsconfig.json` does not include `tests/`. This ensures test-only imports (e.g., test helpers, fixture paths) do not leak into the production type graph.

Import paths: test files reference source modules using a `@src/` path alias mapped to `src/` in `tsconfig.test.json`. This avoids fragile relative `../../src/` chains from deeply nested test files. Example: `import { OFMParser } from '@src/parser/ofm-parser.service'`.

The Phase 1 scaffold specification (see [[plans/phase-01-scaffold]]) is updated to create the `tests/` tree at project initialisation, not `src/__tests__/`.

## Consequences

**Positive:**

- `src/` contains only production code. There is no ambiguity about which files are compiled into the published package.
- Build configuration is simpler: the TypeScript compiler for production points at `src/`; the test runner points at `tests/`. No exclusion globs are needed.
- Fixtures and helpers have a clear, shared home (`tests/fixtures/`, `tests/helpers/`) rather than being duplicated across co-located `__tests__/` directories.
- `docs/test/` requirement matrix can enumerate `tests/` paths without filtering out source file references.
- The BDD step files in `tests/bdd/steps/` are isolated from production source, making it impossible to accidentally import a step file from a service.

**Negative:**

- Navigating from a source file to its test requires crossing a directory boundary (from `src/` to `tests/unit/`). Editors with LSP or file-tree navigation handle this well, but it is a minor ergonomic cost compared to co-located tests.
- The `@src/` path alias must be configured consistently in `tsconfig.test.json`, `bun test` configuration, and any IDE settings. A misconfigured alias produces confusing "module not found" errors.
- The mirroring convention must be enforced by team discipline or a linting rule. If a developer creates `tests/unit/my-feature.spec.ts` instead of `tests/unit/lsp/my-feature.spec.ts`, the mirroring breaks silently.

**Neutral:**

- Bun's test runner discovers test files by glob pattern. Configuring `bun test tests/` is sufficient to discover all spec files under the `tests/` root, including both `unit/` and `integration/` subdirectories.

## Related

- [[requirements/development-process]]
- [[design/behavior-layer]]
- [[plans/phase-01-scaffold]]
- [[plans/phase-03-ofm-parser]]
