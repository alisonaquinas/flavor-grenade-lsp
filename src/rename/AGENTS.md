# AGENTS.md — src/rename/

## Purpose

Thin NestJS grouping module for prepareRename and rename handlers. Handler
logic lives in `src/handlers/`.

## Layout

```
rename/
└── rename.module.ts
```

## Invariants

- `PrepareRenameHandler` must return an error (or null) when the cursor is not
  on a renameable symbol. It must never return a range for non-renameable
  positions (e.g. prose text, code blocks).
- `RenameHandler` must produce a `WorkspaceEdit` — it must not perform direct
  file system writes.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [`src/handlers/`](../handlers/README.md) — handler implementations
