---
title: "Phase 5: Wiki-Link Resolution"
phase: 5
status: planned
tags: [wiki-links, resolution, diagnostics, completion, navigation, ref-graph]
updated: 2026-04-16
---

# Phase 5: Wiki-Link Resolution

| Field      | Value |
|------------|-------|
| Phase      | 5 |
| Title      | Wiki-Link Resolution |
| Status     | ⏳ planned |
| Gate       | `bdd/features/wiki-links.feature` all scenarios pass; diagnostics.feature FG001/FG002/FG003 scenarios pass |
| Depends on | Phase 4 (Vault Index) |

---

## Objective

Implement the full wiki-link feature: resolution of `[[target]]` links to vault documents, production of FG001/FG002/FG003 diagnostics for broken/ambiguous/malformed links, go-to-definition, find-references for headings, and `[[` completion. This is the central feature of the LSP server.

---

## Task List

- [ ] **1. Implement `RefGraph` — the cross-document link graph**

  Create `src/resolution/ref-graph.ts`. The `RefGraph` maintains a bidirectional mapping between link definitions and their referencing wiki-links:

  ```typescript
  export type DefKey = string;   // "<docId>#heading" or "<docId>#^blockId" or "<docId>"

  export interface Ref {
    sourceDocId: DocId;
    entry: WikiLinkEntry;         // from OFMIndex
    resolvedTo: DefKey | null;    // null = unresolved
    diagnostic?: DiagnosticCode;  // FG001 | FG002 | FG003
    candidates?: DocId[];         // for FG002 ambiguous
  }

  export class RefGraph {
    /** Rebuild from current VaultIndex — O(n * links) */
    rebuild(vaultIndex: VaultIndex, folderLookup: FolderLookup): void;

    /** All refs that resolve to defKey */
    refsFor(defKey: DefKey): Ref[];

    /** All unresolved refs (for diagnostic emission) */
    unresolvedRefs(): Ref[];

    /** All ambiguous refs */
    ambiguousRefs(): Ref[];
  }
  ```

- [ ] **2. Implement `Oracle` — name-matching engine**

  Create `src/resolution/oracle.ts`. The Oracle wraps `FolderLookup` and implements the three link-style resolution modes:

  ```typescript
  export type LinkStyle = 'file-stem' | 'title-slug' | 'path-relative';

  export class Oracle {
    resolve(target: string, style: LinkStyle): LookupResult[];
    resolveWithAlias(target: string): LookupResult[];
    resolveHeading(docId: DocId, heading: string): HeadingEntry | undefined;
    resolveBlockId(docId: DocId, blockId: string): BlockAnchorEntry | undefined;
  }
  ```

  Resolution order (Obsidian-compatible):
  1. Exact path match (e.g., `[[notes/alpha]]`)
  2. Alias match from `frontmatter.aliases`
  3. Stem match (longest-suffix wins if unique)
  4. If multiple matches → ambiguous (FG002)
  5. If zero matches → broken (FG001)

- [ ] **3. Implement `LinkResolver.resolveWikiLink`**

  Create `src/resolution/link-resolver.ts`:

  ```typescript
  export class LinkResolver {
    resolveWikiLink(entry: WikiLinkEntry, sourceDocId: DocId): ResolvedLink | UnresolvedLink;
  }

  export interface ResolvedLink {
    kind: 'resolved';
    defKey: DefKey;
    targetDocId: DocId;
    targetHeading?: HeadingEntry;
    targetBlock?: BlockAnchorEntry;
  }

  export interface UnresolvedLink {
    kind: 'unresolved';
    reason: 'broken' | 'ambiguous' | 'malformed';
    code: 'FG001' | 'FG002' | 'FG003';
    candidates?: DocId[];
  }
  ```

- [ ] **4. Implement `DiagnosticService` — FG001, FG002, FG003**

  Create `src/diagnostics/diagnostic-service.ts`. After resolving all links in a document, emit LSP `textDocument/publishDiagnostics` notifications:

  - **FG001 BrokenWikiLink**: severity Error; range = wiki-link span; message = `Cannot resolve wiki-link '[[target]]'`
  - **FG002 AmbiguousWikiLink**: severity Warning; relatedInformation = one entry per candidate file
  - **FG003 MalformedWikiLink**: severity Warning; range = `[[]]` span; message = `Malformed wiki-link: target is empty`

  In single-file mode, skip FG001, FG002, FG003 entirely.

- [ ] **5. Implement `DefinitionService` for wiki-links**

  Create `src/handlers/definition.handler.ts`. Handle `textDocument/definition`:
  1. Find the wiki-link entry at cursor position (use `OFMIndex` binary search on ranges)
  2. If resolved: return `Location { uri, range }` pointing to the target document (line 0) or heading/block line
  3. If unresolved: return `null`

- [ ] **6. Implement `ReferencesService` for headings**

  Create `src/handlers/references.handler.ts`. Handle `textDocument/references`:
  1. Determine what entity the cursor is on (heading, tag, block anchor, document)
  2. Query `RefGraph` for all `Ref`s that resolve to this entity's `DefKey`
  3. Map each `Ref` to a `Location`
  4. If `includeDeclaration`, prepend the definition location

- [ ] **7. Implement wiki-link `CompletionProvider`**

  Create `src/completion/wiki-link-completion-provider.ts`. Triggered by `[[`:
  1. Use `FolderLookup` to enumerate all `DocId`s
  2. For each `DocId`, produce a `CompletionItem` with:
     - `label`: the document stem (or title if `title-slug` style)
     - `kind`: `CompletionItemKind.File` (= 17)
     - `insertText`: formatted per `linkStyle` config
     - `detail`: vault-relative path
  3. Apply `completion.candidates` cap; set `isIncomplete: true` if capped

- [ ] **8. Implement alias resolution from frontmatter**

  In `Oracle.resolveWithAlias()`:
  - For each document in `VaultIndex`, check `frontmatter.aliases` (array of strings)
  - Build an alias index: `Map<string, DocId>`
  - When resolving `[[target]]`, check alias index first

- [ ] **9. Register handlers in `LspModule` capability registry**

  Update `InitializeResult.capabilities` to include:
  ```typescript
  {
    definitionProvider: true,
    referencesProvider: true,
    completionProvider: {
      triggerCharacters: ['[', '#', '>'],
      resolveProvider: false,
    },
  }
  ```

- [ ] **10. Write TDD integration tests with multi-document vault fixtures**

  Create fixture vault at `src/test/fixtures/wiki-link-vault/` with:
  - 5 documents with various link patterns
  - One document with aliases
  - One ambiguous stem (two files with same stem)
  - One broken link

  Tests in `src/test/integration/wiki-links.test.ts`.

---

## Gate Verification

```bash
bun run bdd -- features/wiki-links.feature
bun run bdd -- features/diagnostics.feature --tags "@smoke or @FG001 or @FG002 or @FG003"
```

---

## References

- `[[ddd/resolution/domain-model]]`
- `[[concepts/link-resolution]]`
- `[[ofm-spec/wiki-links]]`
- `[[plans/phase-06-tags]]`
