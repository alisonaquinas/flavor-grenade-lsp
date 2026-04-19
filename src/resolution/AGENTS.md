# AGENTS.md — src/resolution/

## Purpose

Implements all wiki-link and embed resolution logic, diagnostic generation,
and the vault reference graph. This is the semantic core of the server.

## Layout

```
resolution/
├── oracle.ts                         # four-step link resolution engine
├── link-resolver.ts                  # wiki-link → LSP Location
├── embed-resolver.ts                 # embed → LSP Location
├── block-ref-resolver.ts             # [[file#^anchor]] → LSP Location
├── diagnostic-service.ts             # broken/ambiguous/malformed link diagnostics
├── ref-graph.ts                      # DocId → DocId[] bidirectional ref graph
├── wiki-link-completion-provider.ts  # completion for wiki-link targets
├── block-ref-completion-provider.ts  # completion for ^anchor fragments
├── resolution.module.ts
└── __tests__/
```

## Invariants

- The Oracle's alias and title indexes are lazy-built and cached. Call
  `oracle.invalidateAliasIndex()` whenever `VaultIndex` changes (e.g. after a
  file is added, removed, or its frontmatter changes), or alias/title lookups
  will return stale results.
- `DiagnosticService` must not store state between calls — it should re-derive
  diagnostics from the current `VaultIndex` on each invocation.
- `RefGraph` must be kept in sync with `VaultIndex`. Whenever a document is
  indexed or removed, the graph must be rebuilt or updated for that document.

## Workflows

- **Adding a new diagnostic code**: add the code to the `DiagnosticCode` union
  in `oracle.ts`, emit it from `DiagnosticService`, add a BDD scenario in
  `docs/bdd/features/` and a step definition in `src/test/bdd/step-definitions/`.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [CONCEPTS.md](../../CONCEPTS.md) — Oracle, DiagnosticCode, WikiLink
