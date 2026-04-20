# AGENTS.md — src/tags/

## Purpose

Single-file module providing the vault-wide tag index. Used by
`TagCompletionProvider` and `ReferencesHandler`.

## Layout

```
tags/
├── tag-registry.ts
└── __tests__/
    └── tag-registry.test.ts
```

## Invariants

- `TagRegistry` uses upsert semantics: calling `addDoc` for a document that
  is already indexed removes the old occurrences first. Never call `addDoc`
  without reading the implementation — double-indexing a document will
  inflate occurrence counts.
- Tags are stored with their `#` sigil (e.g. `'#project/active'`). Frontmatter
  tag entries without a leading `#` have it prepended automatically.
- The `hierarchy()` method is computed on every call (not cached). Avoid
  calling it in hot paths.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [CONCEPTS.md](../../CONCEPTS.md) — TagRegistry
