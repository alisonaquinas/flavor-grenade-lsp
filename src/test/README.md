# test/

All test infrastructure for the flavor-grenade-lsp server.

## Subdirectories

| Directory      | Role                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `bdd/`         | BDD integration test suite — Cucumber feature runner, step definitions, world, and shared LSP types |
| `integration/` | Classic integration tests that spin up the server process and exercise individual LSP methods       |
| `fixtures/`    | Static vault directories used by tests — not parsed at build time                                   |
| `steps/`       | (Reserved for future Cucumber step helpers)                                                         |
| `support/`     | (Reserved for Cucumber support files)                                                               |

## Test Suites

### Unit tests

Co-located with source files as `*.test.ts` inside `__tests__/` subdirectories.
Run with `bun test`.

### BDD tests

Feature files in `docs/bdd/features/**/*.feature`. Step definitions in
`src/test/bdd/step-definitions/`. Run with `bun run test:bdd`.

### Integration tests

`src/test/integration/*.test.ts`. Run as part of `bun test`.
