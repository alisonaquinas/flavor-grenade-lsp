---
title: "Phase 10: Navigation"
phase: 10
status: planned
tags: [navigation, go-to-definition, find-references, code-lens]
updated: 2026-04-16
---

# Phase 10: Navigation

| Field      | Value |
|------------|-------|
| Phase      | 10 |
| Title      | Navigation |
| Status     | ⏳ planned |
| Gate       | `bdd/features/navigation.feature` all scenarios pass |
| Depends on | Phase 9 (Completions) |

---

## Objective

Complete the navigation feature set: go-to-definition for all link types (wiki-link, embed, block ref, heading ref, tag), find-references for all entity types, and code lens showing reference counts on headings. After this phase, editors can navigate the full vault interactively.

---

## Task List

- [ ] **1. Consolidate and complete `DefinitionService`**

  Ensure `textDocument/definition` handles all cursor positions:
  - Cursor on `[[target]]` → navigate to `notes/target.md` (line 0)
  - Cursor on `[[target#heading]]` → navigate to heading line in `notes/target.md`
  - Cursor on `[[target#^blockid]]` → navigate to block anchor line
  - Cursor on `[[#heading]]` → navigate to heading in current document
  - Cursor on `[[#^blockid]]` → navigate to block anchor in current document
  - Cursor on `![[embed]]` → navigate to target file (markdown or asset)
  - Cursor on `#tag` → navigate to first occurrence of that tag in the vault (or return all via `references`)
  - Cursor on plain text → return `null`

  The service must binary-search the `OFMIndex` ranges to determine what entity is at the cursor position.

- [ ] **2. Consolidate and complete `ReferencesService`**

  Ensure `textDocument/references` handles all entity types at cursor:
  - Cursor on `## Heading` → all `[[doc#Heading]]` links across vault
  - Cursor on `^block-anchor` → all `[[doc#^block-anchor]]` links across vault
  - Cursor on `#tag` → all `#tag` occurrences via `TagRegistry`
  - Cursor on document title (`# Title`) → all `[[docname]]` links (same as heading "title" references)
  - Cursor on `[[wiki-link]]` → return the definition location (go-to-def reverse)
  - Cursor on plain text → return `[]`

  The `includeDeclaration` parameter from the LSP request must be respected:
  - `true`: prepend the definition location (e.g., the heading line itself) to results
  - `false`: return only references (linkers), not the defined entity

- [ ] **3. Implement `CodeLensProvider`**

  Create `src/handlers/code-lens.handler.ts`. Handle `textDocument/codeLens`:
  1. For each `HeadingEntry` in the document's `OFMIndex`:
     - Compute the `DefKey` for this heading
     - Query `RefGraph.refsFor(defKey)` to count references
     - Produce `CodeLens` object:
       ```typescript
       {
         range: heading.range,
         command: {
           title: `${count} reference${count !== 1 ? 's' : ''}`,
           command: 'editor.action.findReferences',
           arguments: [uri, heading.range.start],
         }
       }
       ```
  2. Return all `CodeLens[]` for the document
  3. Headings with 0 references still get a code lens: `"0 references"`

  Register `codeLensProvider: { resolveProvider: false }` in capabilities.

- [ ] **4. Implement cursor position → entity mapping utility**

  Create `src/handlers/cursor-entity.ts`. Given a document `OFMDoc` and a `Position`, return the entity at the cursor:

  ```typescript
  export type CursorEntity =
    | { kind: 'wiki-link'; entry: WikiLinkEntry }
    | { kind: 'embed'; entry: EmbedEntry }
    | { kind: 'heading'; entry: HeadingEntry }
    | { kind: 'block-anchor'; entry: BlockAnchorEntry }
    | { kind: 'tag'; entry: TagEntry }
    | { kind: 'none' };

  export function entityAtPosition(doc: OFMDoc, pos: Position): CursorEntity;
  ```

  Uses binary search over all index ranges. Handles overlapping ranges (e.g., a wiki-link inside a heading) by preferring the most specific (narrowest) range.

- [ ] **5. Handle multi-location definition results**

  In some cases, go-to-definition may return multiple locations (e.g., ambiguous links with FG002 — the server can suggest all candidates). Use `LocationLink[]` instead of `Location` to provide origin selection ranges:

  ```typescript
  {
    originSelectionRange: wikiLinkEntry.range,
    targetUri: candidate.uri,
    targetRange: candidate.range,
    targetSelectionRange: candidate.range,
  }
  ```

- [ ] **6. Implement `textDocument/documentHighlight`**

  Create `src/handlers/document-highlight.handler.ts`. When cursor is on a wiki-link or heading, highlight all references to the same entity within the **current document**:
  - `DocumentHighlightKind.Write` for the definition (heading line, block anchor)
  - `DocumentHighlightKind.Read` for all references within the same file

  Register `documentHighlightProvider: true` in capabilities.

- [ ] **7. Write integration tests for navigation**

  Test file: `src/test/integration/navigation.test.ts`. Use a fixture vault with a known link graph. Assert exact `Location` objects returned by definition and references handlers.

---

## Gate Verification

```bash
bun test src/test/integration/navigation.test.ts
bun run bdd -- features/navigation.feature
```

---

## References

- `[[ddd/navigation/domain-model]]`
- `[[plans/phase-11-rename]]`
