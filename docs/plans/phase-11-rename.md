---
title: "Phase 11: Rename"
phase: 11
status: planned
tags: [rename, refactoring, workspace-edit, prepare-rename]
updated: 2026-04-16
---

# Phase 11: Rename

| Field      | Value |
|------------|-------|
| Phase      | 11 |
| Title      | Rename |
| Status     | ⏳ planned |
| Gate       | `bdd/features/rename.feature` all scenarios pass |
| Depends on | Phase 10 (Navigation) |

---

## Objective

Implement LSP rename refactoring for headings and files. A rename produces a `WorkspaceEdit` that updates both the renamed entity and all references to it across the vault. Rename must handle pipe aliases, path-qualified links, and different link styles, and must validate the rename context before applying changes.

---

## Task List

- [ ] **1. Implement `textDocument/prepareRename`**

  Create `src/handlers/prepare-rename.handler.ts`. Called before `textDocument/rename` to validate the cursor position:
  1. Use `entityAtPosition()` to find what is at the cursor
  2. If `CursorEntity.kind === 'heading'`: return `{ range, placeholder }` where `range` covers the heading text (not the `##` prefix) and `placeholder` is the heading text
  3. If `CursorEntity.kind === 'wiki-link'` and link target resolves unambiguously: return range of the link text
  4. If `CursorEntity.kind === 'none'` or in an opaque region (math, code, comment): return error response `{ error: { code: -32602, message: 'Cannot rename at this location' } }`
  5. If `CursorEntity.kind === 'block-anchor'`: return `{ range, placeholder }` for the anchor ID

- [ ] **2. Implement `textDocument/rename` for heading rename**

  Create `src/handlers/rename.handler.ts`. For heading rename:
  1. Get `HeadingEntry` at cursor via `entityAtPosition()`
  2. Compute `defKey` for the heading
  3. Query `RefGraph.refsFor(defKey)` to get all `Ref[]`
  4. Build `WorkspaceEdit`:
     - Change 1: in source document, replace heading text (not `##` prefix, just the text)
     - Change N: for each `Ref`, replace the heading fragment in the wiki-link text
       - `[[doc#Old Heading]]` → `[[doc#New Heading]]`
       - `[[doc#Old Heading|alias]]` → `[[doc#New Heading|alias]]` (alias preserved)
  5. Return `WorkspaceEdit`

- [ ] **3. Implement `textDocument/rename` for file rename**

  For file rename (cursor on document title or file stem in completion):
  1. Determine the old `DocId` from the current document's URI
  2. Query `RefGraph` for all refs targeting this `DocId` (any heading, the doc itself)
  3. Build `WorkspaceEdit`:
     - `documentChanges` with `RenameFile` operation: `{ kind: 'rename', oldUri, newUri }`
     - Text edits in all referencing documents:
       - `[[old-stem]]` → `[[new-stem]]`
       - `[[old-stem|alias]]` → `[[new-stem|alias]]`
       - `[[old-stem#heading]]` → `[[new-stem#heading]]`
       - `[[folder/old-stem]]` → `[[folder/new-stem]]` (path-qualified links)
  4. Return `WorkspaceEdit`

- [ ] **4. Handle link style variants in rename edits**

  The rename engine must produce edits that match the link style of each existing reference:
  - If the existing link uses `file-stem` style: update using stem only
  - If the existing link uses `file-path-stem` style: update the full path including the path prefix
  - The server does NOT convert between link styles during rename — it preserves each link's existing style

- [ ] **5. Handle pipe aliases during heading rename**

  When renaming heading `Old Heading` to `New Heading`:
  - `[[doc#Old Heading]]` → `[[doc#New Heading]]` (no alias: target changes, display changes)
  - `[[doc#Old Heading|My Label]]` → `[[doc#New Heading|My Label]]` (alias preserved, only target changes)
  - `[[doc#Old Heading|Old Heading]]` → `[[doc#New Heading|New Heading]]` (alias was equal to heading: update both)

  Rule: if the alias was **identical** to the old heading text, update the alias too. Otherwise, preserve the alias.

- [ ] **6. Handle zero-reference rename (no-op WorkspaceEdit)**

  When the renamed entity has no references:
  - Still produce a valid `WorkspaceEdit` containing the single change to the source document
  - Do NOT return an error
  - Return `WorkspaceEdit` with only the definition-site change

- [ ] **7. Implement `WorkspaceEditBuilder`**

  Create `src/handlers/workspace-edit-builder.ts`. A builder that accumulates text edits keyed by URI and produces an LSP `WorkspaceEdit`:

  ```typescript
  export class WorkspaceEditBuilder {
    addTextEdit(uri: string, range: Range, newText: string): this;
    addRenameFile(oldUri: string, newUri: string): this;
    build(): WorkspaceEdit;
  }
  ```

  The builder deduplicates edits for the same range and sorts edits in reverse line order (applying from bottom to top preserves offsets during multi-edit operations).

- [ ] **8. Reject rename in opaque regions**

  In `prepareRename`, if the cursor is inside a code block, math block, or comment (check `OFMDoc.opaqueRegions`), return error: `Cannot rename at this location`.

- [ ] **9. Write integration tests for rename**

  Test file: `src/test/integration/rename.test.ts`. Use a fixture vault with:
  - A document with two headings (one with references, one orphaned)
  - Three documents that link to various headings
  - One document with pipe-aliased links

  Assert the exact `WorkspaceEdit` structure returned.

---

## Gate Verification

```bash
bun test src/test/integration/rename.test.ts
bun run bdd -- features/rename.feature
```

---

## References

- `[[concepts/rename-refactoring]]`
- `[[ddd/workspace-edit/domain-model]]`
- `[[plans/phase-12-code-actions]]`
