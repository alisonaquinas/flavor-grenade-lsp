# resolution/

Wiki-link resolution, diagnostic generation, and the reference graph.

This module contains the core OFM semantics: given a `[[target]]` string, find
the document it points to (or diagnose why it cannot be found).

## Files

| File                               | Role                                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `oracle.ts`                        | `Oracle` — Obsidian-style wiki-link resolution: exact path → case-insensitive path → path suffix → alias → stem → H1 title |
| `link-resolver.ts`                 | Resolves a wiki-link entry from an `OFMDoc` to an LSP `Location` using the Oracle                                          |
| `embed-resolver.ts`                | Same as `link-resolver.ts` but for embed (`![[…]]`) entries                                                                |
| `block-ref-resolver.ts`            | Resolves `[[file#^anchor]]` deep links to the exact `Location` of the `^anchor` in the target file                         |
| `diagnostic-service.ts`            | Iterates wiki-links in an `OFMDoc`, calls the Oracle, and emits LSP diagnostics for broken/ambiguous/malformed links       |
| `ref-graph.ts`                     | Bidirectional reference graph (`DocId → DocId[]`) used to find all inbound links for the `references` request              |
| `wiki-link-completion-provider.ts` | Provides completion items for wiki-link targets                                                                            |
| `block-ref-completion-provider.ts` | Provides completion items for `[[file#^` block-reference fragments                                                         |
| `resolution.module.ts`             | NestJS module exporting `Oracle`, `DiagnosticService`, resolvers, and the ref graph                                        |

## Resolution Algorithm (Oracle)

1. Normalize `\` to `/` and strip one trailing `.md` extension.
2. Exact `DocId` match — the target is already a valid relative path.
3. Case-insensitive `DocId` match — preserves navigation on case-insensitive vaults.
4. Path-suffix match for path-like targets — `[[sources/foo]]` can resolve to `wiki/sources/foo.md` when the trailing path segments match on a `/` boundary. Multiple suffix matches → FG002.
5. Frontmatter alias match (case-insensitive) — the target matches an `aliases` entry.
6. Stem match via `FolderLookup` — unique match → resolved; multiple matches → FG002.
7. H1 title match (case-insensitive) — matches the first H1 heading text.
8. None of the above → FG001 (broken link).
