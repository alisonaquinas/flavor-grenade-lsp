# AGENTS.md — src/

## Purpose

Root of all server source. Every feature module lives under a subdirectory
here. `main.ts` is the only file at this level and should not grow further.

## Layout

```
src/
├── main.ts          # NestJS bootstrap — do not add logic here
├── transport/
├── lsp/
├── parser/
├── vault/
├── resolution/
├── completion/
├── handlers/
├── navigation/
├── rename/
├── code-actions/
├── tags/
└── test/
```

## Workflows

- **Adding a new LSP method**: create a handler class in `handlers/` (or inside
  the relevant feature module), register it in `lsp/lsp.module.ts` via
  `dispatcher.onRequest(...)` or `dispatcher.onNotification(...)`.
- **Adding a new module**: create the directory, add `*.module.ts`, import it
  in `lsp/lsp.module.ts`.

## Invariants

- `main.ts` only bootstraps — no request handling logic belongs there.
- Each feature module exports only the providers that `LspModule` needs to
  inject directly.

## See Also

- [Root AGENTS.md](../AGENTS.md)
