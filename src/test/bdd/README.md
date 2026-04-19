# test/bdd/

BDD integration test suite for flavor-grenade-lsp.

Uses [Cucumber.js](https://cucumber.io/docs/cucumber/) with Bun. Each test
scenario starts a real server subprocess over stdio, performs the LSP
initialize handshake, and then exercises one or more LSP methods against a
temporary vault.

## Files

| File | Role |
| --- | --- |
| `world.ts` | `FGWorld` — Cucumber world class; manages the server process, sends requests, collects diagnostics |
| `lsp-types.ts` | TypeScript interface definitions for all LSP protocol shapes used in BDD assertions (Location, Diagnostic, CompletionList, WorkspaceEdit, etc.) |

## Subdirectories

| Directory | Role |
| --- | --- |
| `step-definitions/` | One `*.steps.ts` file per feature area — Given/When/Then implementations |

## Feature Files

Feature files live in `docs/bdd/features/**/*.feature` (outside `src/`).
The Cucumber configuration in `cucumber.yaml` maps them to this step directory.

## Running

```bash
bun run test:bdd                          # all BDD tests
bun run test:bdd --tags @smoke            # smoke tag only
```
