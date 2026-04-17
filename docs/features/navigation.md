---
title: Feature — Navigation
tags: [features/, navigation, go-to-definition, find-references]
aliases: [go-to-def, find references, navigation features]
---

# Feature — Navigation

Navigation encompasses two complementary LSP capabilities: **go-to-definition** (`textDocument/definition`) and **find-references** (`textDocument/references`). Together they allow users to traverse the link graph of a vault without leaving their editor.

> [!NOTE]
> All navigation features in vault mode operate on the full OFMIndex built during Phase 4 ([[plans/phase-04-vault-index]]). In single-file mode, only intra-document navigation (e.g., to a heading in the same file) is available.

## Go-to-Definition

The server handles `textDocument/definition` requests. The response is a `Location` (single target) or `Location[]` (multiple targets, when a link is ambiguous).

### Supported Ref Types for Go-to-Definition

| Cursor position | Target | Notes |
|---|---|---|
| Inside `[[target]]` | First line of the resolved document | Returns single `Location` if unambiguous |
| Inside `[[target]]` (ambiguous) | All matching documents | Returns `Location[]` — editor shows a picker |
| Inside `[[doc#heading]]` after `#` | The heading line in the resolved document | Character offset points to the `#` of the heading |
| Inside `[[doc#^id]]` after `#^` | The line containing `^id` anchor in the resolved document | Character offset points to the `^` character |
| Inside `![[embed]]` | The embedded file | Non-`.md` files are opened in the editor as a binary/image preview |
| Inside `#tag` body tag | The first occurrence of the tag across the vault | In single-file mode, the first occurrence in the current document |
| Inside a frontmatter `aliases:` value | The document itself | Resolves to the document's own first line (self-reference) |

### Ambiguous Resolution

When `[[target]]` matches multiple documents (FG002 would fire), go-to-definition returns all matches as a `Location[]`. The editor renders these as a multi-choice picker (VS Code shows "Peek Definitions"; Neovim prompts via `vim.ui.select`). This is preferable to silently picking one candidate — the user should resolve the ambiguity by qualifying the link.

### Single-File Mode Behaviour

In single-file mode, only these go-to-definition targets work:

- `[[doc#heading]]` where `doc` is the current file → jumps to the heading within the current document
- `#tag` → jumps to the first `#tag` in the current document

All inter-file navigation returns an empty response (`null`) in single-file mode.

## Find-References

The server handles `textDocument/references` requests. The cursor position determines which entity's references are searched. The response is a `Location[]` covering all uses in the vault.

### Supported Def Types for Find-References

| Cursor position | Returns |
|---|---|
| On a heading line (e.g., `## My Heading`) | All `[[doc#My Heading]]` occurrences in vault |
| On a document's first line, or anywhere in body where no specific def is under cursor | All `[[doc]]`, `[[doc#...]]`, `![[doc]]` occurrences in vault |
| On a `^blockid` anchor | All `[[doc#^blockid]]` occurrences in vault |
| On a `#tag` | All `#tag` and `#tag/sub` occurrences in vault (hierarchical) |
| Inside a frontmatter `aliases:` value | All `[[alias]]` occurrences that resolve to this document |

### Include Declaration Behaviour

The LSP `references` request includes a `context.includeDeclaration` boolean. When `true`:

- For a heading: the heading line itself is included in the results
- For a `^blockid`: the anchor line itself is included
- For a document: the document is included as a self-reference at line 0

### Find-References in Single-File Mode

In single-file mode, find-references only returns occurrences within the current document. Cross-vault search is unavailable without the vault index.

## Code Lens

Code lens is specified separately in [[features/code-lens]]. It is closely related to find-references — clicking a code lens item triggers a `textDocument/references` request at the code lens position.

## Related Information on Diagnostics

Find-references is also the mechanism used to populate `relatedInformation` on FG002 (AmbiguousWikiLink) diagnostics — the diagnostic carries `Location` entries for each of the ambiguous candidates, enabling "jump to all candidates" from the diagnostic popup. See [[features/diagnostics]].

## Performance Characteristics

Find-references is a graph traversal over `RefGraph`. For vaults with up to 10,000 documents, a full traversal should complete in under 100 ms. For larger vaults, the implementation must cache the reverse-ref index (mapping from `DocId` to all `Ref` entries that point at it) and invalidate it incrementally on file change events.

Workspace symbol search ([[features/symbols]]) shares the same index and has similar performance characteristics.

## Configuration Keys

There are no user-facing configuration keys specific to navigation. Navigation inherits the vault index built by Phase 4 and uses the same debounce mechanism as diagnostics for any index updates that affect find-references results.

## Related

- [[ADR006-block-ref-indexing]]
- [[features/code-lens]]
- [[features/diagnostics]]
- [[features/symbols]]
- [[features/rename]]
- [[concepts/symbol-model]]
- [[requirements/wiki-link-resolution]]
- [[requirements/block-references]]
