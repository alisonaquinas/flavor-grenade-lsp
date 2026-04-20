# AGENTS.md — src/completion/

## Purpose

Provides all LSP completion logic. The `CompletionRouter` is the single handler
registered with the dispatcher for `textDocument/completion`.

## Layout

```
completion/
├── completion-router.ts              # dispatch to per-trigger provider
├── context-analyzer.ts               # identify trigger from text before cursor
├── callout-completion-provider.ts    # > [!TYPE] callout keywords
├── embed-completion-provider.ts      # ![[target]] embed targets
├── heading-completion-provider.ts    # [[file#Heading]] fragments
├── tag-completion-provider.ts        # #tag tokens
├── completion.module.ts
└── __tests__/
```

## Invariants

- `CompletionRouter` caches document text in its own `Map<uri, string>` because
  completion requests may arrive before the vault index has been updated for
  the latest change. `LspModule` calls `setDocumentText` synchronously on
  `didOpen` and `didChange` for this reason.
- Providers must return results synchronously — the `handleCompletion` method
  in `LspModule` wraps them in `Promise.resolve(...)`.
- Each provider must return `{ items, isIncomplete }` even when there are no
  matches; never return `null` from a completion provider.

## Workflows

- **Adding a new provider**: implement the provider class, add it to
  `completion.module.ts` providers and exports, inject it in
  `CompletionRouter`, add a case in the router's dispatch logic.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [`src/resolution/`](../resolution/README.md) — wiki-link and block-ref completion providers
