# resolution/

Wiki-link resolution, diagnostic generation, and the reference graph.

This module contains the core OFM semantics: given a `[[target]]` string, find
the document it points to (or diagnose why it cannot be found).

## Files

| File                               | Role                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `oracle.ts`                        | `Oracle` — four-step wiki-link resolution: exact path → alias → stem → H1 title                                      |
| `link-resolver.ts`                 | Resolves a wiki-link entry from an `OFMDoc` to an LSP `Location` using the Oracle                                    |
| `embed-resolver.ts`                | Same as `link-resolver.ts` but for embed (`![[…]]`) entries                                                          |
| `block-ref-resolver.ts`            | Resolves `[[file#^anchor]]` deep links to the exact `Location` of the `^anchor` in the target file                   |
| `diagnostic-service.ts`            | Iterates wiki-links in an `OFMDoc`, calls the Oracle, and emits LSP diagnostics for broken/ambiguous/malformed links |
| `ref-graph.ts`                     | Bidirectional reference graph (`DocId → DocId[]`) used to find all inbound links for the `references` request        |
| `wiki-link-completion-provider.ts` | Provides completion items for wiki-link targets                                                                      |
| `block-ref-completion-provider.ts` | Provides completion items for `[[file#^` block-reference fragments                                                   |
| `resolution.module.ts`             | NestJS module exporting `Oracle`, `DiagnosticService`, resolvers, and the ref graph                                  |

## Resolution Algorithm (Oracle)

1. Exact `DocId` match — the target is already a valid relative path
2. Frontmatter alias match (case-insensitive) — the target matches an `aliases` entry
3. Stem suffix match via `FolderLookup` — unique match → resolved; multiple matches → FG002
4. H1 title match (case-insensitive) — matches the first H1 heading text
5. None of the above → FG001 (broken link)
