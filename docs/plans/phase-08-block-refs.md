---
title: "Phase 8: Block References"
phase: 8
status: planned
tags: [block-refs, block-anchors, diagnostics, navigation, completion]
updated: 2026-04-16
---

# Phase 8: Block References

| Field      | Value |
|------------|-------|
| Phase      | 8 |
| Title      | Block References |
| Status     | ⏳ planned |
| Gate       | `bdd/features/block-references.feature` all scenarios pass |
| Depends on | Phase 5 (Wiki-Link Resolution) |

---

## Objective

Implement the block reference subsystem: indexing of `^blockid` anchors, resolution of `[[doc#^blockid]]` cross-references, FG005 diagnostics for broken block refs, go-to-definition, find-references, and completion for block IDs after the `[[doc#^` trigger.

---

## Task List

- [ ] **1. Ensure `BlockAnchorEntry` is fully populated in `OFMIndex`**

  Verify that `BlockAnchorParser` (Phase 3) correctly produces `BlockAnchorEntry` objects with:

  ```typescript
  export interface BlockAnchorEntry {
    id: string;      // The anchor ID (without the ^)
    range: Range;    // LSP Range covering "^anchor-id" on its source line
    lineRange: Range; // Range of the entire line containing the anchor
  }
  ```

  Unit-test edge cases: anchor at very end of file, anchor on a list item line, anchor on a heading line (Obsidian supports this).

- [ ] **2. Add `CrossBlock` ref type to `RefGraph`**

  Update `RefGraph` to track `[[doc#^blockid]]` references as `CrossBlockRef`:

  ```typescript
  export interface CrossBlockRef {
    sourceDocId: DocId;
    targetDocId: DocId | null;   // null = intra-document (same file)
    anchorId: string;
    entry: WikiLinkEntry;
    resolvedTo: BlockAnchorEntry | null;
    diagnostic?: 'FG005';
  }
  ```

  Intra-document refs (`[[#^blockid]]`) set `targetDocId` to null and resolve within the source document.

- [ ] **3. Implement block ref resolution in `LinkResolver`**

  Update `LinkResolver.resolveWikiLink()` to handle the `blockId` field of `WikiLinkEntry`:
  1. If `entry.blockId` is set, this is a block reference
  2. If `entry.target` is empty (intra-doc): look up anchor in the source document's `OFMIndex`
  3. If `entry.target` is non-empty: resolve the target document first, then look up anchor in that doc's `OFMIndex`
  4. If anchor not found → `FG005`

- [ ] **4. Implement FG005 diagnostic**

  Update `DiagnosticService` to emit FG005 for broken block references:
  - **FG005 BrokenBlockRef**: severity Error; message = `Cannot resolve block reference '^blockid' in '[[target]]'`
  - FG005 is an Error (more severe than FG004 Warning) because block refs typically have semantic meaning
  - In single-file mode, FG005 is suppressed for cross-file refs but NOT for intra-document refs

- [ ] **5. Implement go-to-definition for block refs**

  Update `DefinitionService` to handle `WikiLinkEntry` with `blockId`:
  1. Resolve the `CrossBlockRef` to a `BlockAnchorEntry`
  2. Return `Location { uri: targetDoc.uri, range: anchorEntry.range }`
  3. The cursor should land on the `^anchor-id` text itself

- [ ] **6. Implement find-references for block anchors**

  Update `ReferencesService` to handle cursor on a `^blockid` anchor:
  1. Find the `BlockAnchorEntry` at cursor position in the source document's `OFMIndex`
  2. Query `RefGraph` for all `CrossBlockRef`s that resolve to this anchor's `DefKey`
  3. Return all referencing locations as `Location[]`

- [ ] **7. Implement block ref completion**

  Create `src/completion/block-ref-completion-provider.ts`. Triggered after `[[doc#^`:
  1. Parse the partial text to extract the target document stem (e.g., `doc`)
  2. Resolve the target document via `Oracle`
  3. If resolved: enumerate all `BlockAnchorEntry[]` from that doc's `OFMIndex`
  4. Return `CompletionItem[]` with `label: anchorEntry.id`, `kind: CompletionItemKind.Reference`
  5. If target not resolved: return empty list

- [ ] **8. Handle intra-document block refs `[[#^id]]`**

  These are wiki-links where `entry.target === ''` and `entry.blockId` is set. The target document is the same as the source document. Resolution queries the source document's own `OFMIndex`.

  In completion: after `[[#^`, enumerate block anchors in the **current** document.

- [ ] **9. Write unit tests for block ref resolution**

  Test file: `src/resolution/__tests__/block-ref-resolver.test.ts`. Test cases:
  - Cross-document ref resolves to anchor in another doc
  - Intra-document ref `[[#^id]]` resolves to own anchor
  - Missing anchor in existing doc → FG005
  - Missing doc entirely → FG001 (handled by wiki-link resolver, not FG005)
  - Anchor at end-of-file with no trailing newline is still found
  - Anchor in list item is indexed correctly
  - Completion returns correct anchors for target doc
  - Completion for intra-doc `[[#^` returns current doc's anchors

---

## Gate Verification

```bash
bun test src/resolution/__tests__/block-ref-resolver.test.ts
bun run bdd -- features/block-references.feature
```

---

## References

- `[[ofm-spec/block-references]]`
- `[[ddd/resolution/domain-model]]`
- `[[plans/phase-09-completions]]`
