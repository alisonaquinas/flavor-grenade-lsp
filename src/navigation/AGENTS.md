# AGENTS.md — src/navigation/

## Purpose

Thin NestJS grouping module for code lens and document highlight. The handler
logic lives in `src/handlers/`. This module exists to keep the dependency
declarations separate from `LspModule`.

## Layout

```
navigation/
└── navigation.module.ts
```

## Invariants

- This module only groups existing handlers — it does not contain handler
  logic itself. If new navigation handlers are added, place the implementation
  in `src/handlers/` and add the provider here.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [`src/handlers/`](../handlers/README.md) — handler implementations
