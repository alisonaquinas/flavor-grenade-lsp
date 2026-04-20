# AGENTS.md — src/test/bdd/

## Purpose

Contains the Cucumber world and shared LSP types for the BDD integration
suite. Step definition files are in `step-definitions/`.

## Layout

```
bdd/
├── world.ts              # FGWorld — server process management and request helpers
├── lsp-types.ts          # shared LSP response type definitions for assertions
└── step-definitions/     # *.steps.ts per feature area
```

## Invariants

- `FGWorld` creates a fresh temporary vault directory and a fresh server
  process for each scenario. Steps must not assume any pre-existing server
  state between scenarios.
- `lsp-types.ts` is the only place LSP protocol shapes are typed for BDD use.
  Never use `any` casts in step files — add a type to `lsp-types.ts` instead.
- `FGWorld.request(method, params)` returns `Promise<unknown>`. Step
  definitions cast the result to the appropriate type from `lsp-types.ts`
  using `as SpecificType | null`.

## Workflows

- **Adding a new step**: identify which `*.steps.ts` file covers the feature
  area, add the step there. If the area is new, create a new steps file.
- **Adding a new LSP type for assertions**: add the interface to `lsp-types.ts`
  and import it in the relevant steps file.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
