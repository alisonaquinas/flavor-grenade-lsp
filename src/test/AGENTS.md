# AGENTS.md — src/test/

## Purpose

Houses all non-unit test infrastructure: BDD world and step definitions,
integration tests, and shared test fixtures.

## Layout

```
test/
├── bdd/
│   ├── world.ts                 # FGWorld — Cucumber world class with server process management
│   ├── lsp-types.ts             # TypeScript types for LSP protocol shapes used in assertions
│   └── step-definitions/        # Cucumber step definition files, one per feature area
├── integration/
│   ├── navigation.test.ts
│   ├── rename.test.ts
│   ├── transport.test.ts
│   └── wiki-links.test.ts
├── fixtures/
│   ├── vault-detection/         # Vaults for testing vault-mode detection
│   └── wiki-link-vault/         # Vault for testing wiki-link resolution
├── steps/                       # (reserved)
└── support/                     # (reserved)
```

## Invariants

- `FGWorld` (`bdd/world.ts`) manages the server process lifecycle. Each BDD
  scenario gets a fresh `FGWorld` instance (set up in `hooks.ts`). Do not
  share server processes between scenarios.
- `lsp-types.ts` is the shared type contract for all BDD assertions.
  If a new LSP response shape is needed, add it here rather than using `any`
  casts in step files.
- Fixtures are static files on disk. Tests that need a temporary vault must
  use `FGWorld.writeVaultFile(...)` to create files in the temp vault
  directory, not modify the committed fixtures.

## Workflows

- **Adding a new BDD feature**: write the `.feature` file under
  `docs/bdd/features/`, add step definitions to a new or existing
  `*.steps.ts` file under `step-definitions/`.
- **Adding a test fixture**: place static vault files under `fixtures/`,
  keeping each fixture vault in its own subdirectory.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
