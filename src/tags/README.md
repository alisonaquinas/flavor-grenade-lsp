# tags/

Vault-wide tag occurrence index.

`TagRegistry` is an injectable singleton that maintains a complete index of
all tag occurrences across the vault — from both inline `#tag` tokens and
YAML frontmatter `tags:` arrays.

## Files

| File              | Role                                                                                |
| ----------------- | ----------------------------------------------------------------------------------- |
| `tag-registry.ts` | `TagRegistry` — occurrence map, frequency queries, prefix filtering, hierarchy tree |

## Key Operations

| Method                   | Returns                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `rebuild(index)`         | Rebuilds the entire registry from a `VaultIndex`                   |
| `addDoc(docId, doc)`     | Upserts occurrences for a single document                          |
| `removeDoc(docId)`       | Removes all occurrences for a document                             |
| `allTags()`              | All tags sorted by frequency descending                            |
| `occurrences(tag)`       | All `TagOccurrence` records for an exact tag                       |
| `tagsWithPrefix(prefix)` | Tags whose body starts with the given prefix (used for completion) |
| `hierarchy()`            | Slash-delimited tag tree as `TagNode[]`                            |
