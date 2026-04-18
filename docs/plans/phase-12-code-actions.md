---
title: "Phase 12: Code Actions"
phase: 12
status: planned
tags: [code-actions, toc, create-file, tag-to-yaml, workspace-symbols, semantic-tokens]
updated: 2026-04-16
---

# Phase 12: Code Actions

| Field      | Value |
|------------|-------|
| Phase      | 12 |
| Title      | Code Actions |
| Status     | ⏳ planned |
| Gate       | Code action scenarios pass (TOC generation, create-missing-file, tag-to-yaml); workspace symbol provider returns correct results; semantic token encoding verified |
| Depends on | Phase 11 (Rename) |

---

## Objective

Implement productivity code actions: generate table of contents, create a missing file from a broken wiki-link, migrate inline tags to frontmatter. Also implement workspace symbol search and semantic token highlighting for OFM-specific syntax elements.

---

## Task List

- [ ] **1. Implement `textDocument/codeAction` dispatcher**

  > **Diagnostic codes introduced in this phase:**
  > - **FG006** — Non-breaking space detected in document body (severity: Warning). Emitted by `DiagnosticService` during document parsing when a U+00A0 character is found outside frontmatter. This is the first phase that defines FG006; extend `DiagnosticService` (introduced in Phase 5) to detect and emit it.
  > - **FG007** was introduced in Phase 3 (`FrontmatterParser`).
  >
  > Full diagnostic code registry for reference: FG001 (broken wiki-link), FG002 (ambiguous wiki-link), FG003 (malformed wiki-link), FG004 (broken embed), FG005 (broken block ref), FG006 (non-breaking space), FG007 (malformed YAML frontmatter).

  Create `src/handlers/code-action.handler.ts`. The dispatcher:
  1. Receives a `CodeActionParams` with the cursor range and optional diagnostics in range
  2. Checks which code action providers are applicable:
     - If `FG001` diagnostic in range → offer "Create missing note"
     - If cursor on `#tag` in document body → offer "Move tag to frontmatter"
     - If cursor on or near a heading → offer "Generate table of contents"
     - If `FG006` diagnostic (non-breaking space) → offer "Fix whitespace" (quick-fix)
     - If `FG007` diagnostic (malformed YAML) → offer "Remove frontmatter" (destructive fix)
  3. Return `CodeAction[]`

- [ ] **2. Implement "Create missing note" code action (FG001)**

  Create `src/code-actions/create-missing-file.action.ts`. When a FG001 diagnostic is in the code action range:
  1. Extract the broken wiki-link target from the diagnostic (e.g., `nonexistent-note`)
  2. Determine the new file path using the vault root and `linkStyle` config
  3. Produce a `CodeAction`:

     ```typescript
     {
       title: `Create 'nonexistent-note.md'`,
       kind: CodeActionKind.QuickFix,
       diagnostics: [fg001Diagnostic],
       edit: {
         documentChanges: [
           { kind: 'create', uri: newFileUri, options: { ignoreIfExists: true } },
           // Also add a CreateFile change that writes a heading:
           // "# nonexistent-note\n"
         ]
       }
     }
     ```

- [ ] **3. Implement "Generate Table of Contents" code action**

  Create `src/code-actions/toc-generator.action.ts`. When cursor is anywhere in the document:
  1. Collect all `HeadingEntry[]` from the document's `OFMIndex`
  2. Generate markdown TOC:

     ```markdown
     ## Table of Contents
     - [[#Heading 1]]
       - [[#Sub Heading]]
     - [[#Heading 2]]
     ```

  3. Produce a `CodeAction` with `WorkspaceEdit` that inserts the TOC:
     - If a TOC already exists (detect by `## Table of Contents` heading), offer "Replace TOC"
     - Otherwise, offer "Insert TOC after first heading"

- [ ] **4. Extend "Move tag to frontmatter" code action with edge-case handling**

  > **Delineation with Phase 6:** Phase 6 task 6 implements the basic `fg.tagToYaml` action (single occurrence, no existing frontmatter complications). This task extends that implementation with production-ready edge cases. Do NOT re-implement the basic flow; extend the existing `src/code-actions/tag-to-yaml.action.ts`.

  1. Cursor on inline `#tag` in document body
  2. Code action title: `"Move '#tag' to frontmatter"`
  3. `WorkspaceEdit`:
     - Delete inline `#tag` token from body
     - Merge into frontmatter `tags:` array (creating frontmatter if absent)
  4. Handle edge cases not covered by Phase 6:
     - Tag already present in frontmatter → surface info diagnostic; return no-op `CodeAction` with title "Tag already in frontmatter"
     - Multiple `#tag` occurrences in the same document → move all occurrences in a single `WorkspaceEdit` (batch delete + single frontmatter insert)

- [ ] **5. Implement "Fix non-breaking space" quick-fix (FG006)**

  Create `src/code-actions/fix-nbsp.action.ts`. When FG006 diagnostic is present:
  1. Extract the range of the non-breaking space character
  2. Produce a `CodeAction` with `isPreferred: true`:

     ```typescript
     {
       title: 'Replace non-breaking space with regular space',
       kind: CodeActionKind.QuickFix,
       isPreferred: true,
       edit: { changes: { [uri]: [{ range: nbspRange, newText: ' ' }] } }
     }
     ```

- [ ] **6. Implement `workspace/symbol` provider**

  Create `src/handlers/workspace-symbol.handler.ts`. Handle `workspace/symbol` requests:
  1. Query across entire `VaultIndex` for matching entities
  2. Search by query string in: document titles (headings H1), all headings, tag names, block anchor IDs
  3. Return `WorkspaceSymbol[]`:

     ```typescript
     {
       name: 'Section Alpha',
       kind: SymbolKind.String,   // for headings
       location: { uri, range },
     }
     ```

  4. Cap results at 50 items; use fuzzy matching (simple prefix/substring match)

  Register `workspaceSymbolProvider: true` in capabilities.

- [ ] **7. Implement `textDocument/documentSymbol` provider**

  Create `src/handlers/document-symbol.handler.ts`. Returns a tree of symbols for a single document:
  1. Top-level symbols: H1 headings → document sections
  2. Nested: H2 under H1, H3 under H2, etc.
  3. Also include block anchors as `SymbolKind.Key` symbols
  4. Return `DocumentSymbol[]` (hierarchical, not flat `SymbolInformation[]`)

  Register `documentSymbolProvider: true` in capabilities.

- [ ] **8. Implement semantic token provider**

  Create `src/handlers/semantic-tokens.handler.ts`. Provide semantic token types for OFM elements:

  | OFM element | Semantic type | Modifier |
  |-------------|---------------|----------|
  | `[[wiki-link]]` | `string` | `declaration` |
  | `![[embed]]` | `string` | `declaration` |
  | `#tag` | `keyword` | — |
  | `^anchor-id` | `label` | — |
  | `> [!NOTE]` callout type | `enumMember` | — |
  | Frontmatter key | `property` | `declaration` |

  Register:

  ```typescript
  semanticTokensProvider: {
    legend: { tokenTypes: [...], tokenModifiers: [...] },
    full: true,
    range: false,
  }
  ```

---

## Gate Verification

```bash
# Code action integration tests
bun test src/test/integration/code-actions.test.ts

# Workspace symbol tests
bun test src/handlers/__tests__/workspace-symbol.test.ts

# Semantic token encoding tests
bun test src/handlers/__tests__/semantic-tokens.test.ts

# BDD: FG006 quick-fix and diagnostics
bun run bdd -- features/diagnostics.feature --tags "@FG006"

# BDD: code actions (TOC, create-missing-file, tag-to-yaml)
bun run bdd -- features/code-actions.feature

# Full gate (all of the above)
bun run gate:12
```

---

## References

- `[[concepts/code-actions]]`
- `[[plans/phase-13-ci-delivery]]`
