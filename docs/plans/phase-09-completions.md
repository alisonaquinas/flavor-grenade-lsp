---
title: "Phase 9: Completions"
phase: 9
status: planned
tags: [completions, completion-provider, callouts, headings, block-refs]
updated: 2026-04-16
---

# Phase 9: Completions

| Field      | Value |
|------------|-------|
| Phase      | 9 |
| Title      | Completions |
| Status     | ⏳ planned |
| Gate       | `bdd/features/completions.feature` all scenarios pass |
| Depends on | Phase 6 (Tags), Phase 7 (Embeds), Phase 8 (Block Refs) |

---

## Objective

Implement the full completion provider that handles all trigger characters and completion contexts. This phase consolidates and extends the partial completion implementations from Phases 5, 6, and 8, and adds heading completion and callout type completion. After this phase, the LSP reports comprehensive `completionProvider` capabilities.

---

## Task List

- [ ] **1. Implement unified `CompletionRouter`**

  Create `src/completion/completion-router.ts`. This is the single entry point for `textDocument/completion` requests. It analyzes the cursor context and routes to the appropriate sub-provider:

  ```typescript
  export class CompletionRouter {
    async complete(params: CompletionParams, doc: OFMDoc): Promise<CompletionList> {
      const context = this.analyzeContext(doc, params.position);
      switch (context.kind) {
        case 'wiki-link':       return this.wikiLinkProvider.complete(context);
        case 'wiki-link-heading': return this.headingProvider.complete(context);
        case 'wiki-link-block':   return this.blockRefProvider.complete(context);
        case 'embed':           return this.embedProvider.complete(context);
        case 'tag':             return this.tagProvider.complete(context);
        case 'callout':         return this.calloutProvider.complete(context);
        default:                return { isIncomplete: false, items: [] };
      }
    }
  }
  ```

- [ ] **2. Implement `ContextAnalyzer`**

  Create `src/completion/context-analyzer.ts`. Determines the completion context from cursor position:
  - Scan backwards from cursor to find trigger sequence
  - `[[` → `wiki-link` context (no `#` before cursor)
  - `[[doc#` (no `^`) → `wiki-link-heading` context; extracts `targetStem = "doc"`, `headingPrefix = ""`
  - `[[doc#^` → `wiki-link-block` context; extracts `targetStem = "doc"`, `anchorPrefix = ""`
  - `![[` → `embed` context
  - `#` (preceded by whitespace or line start) → `tag` context
  - `> [!` → `callout` context
  - Anything else → `none`

- [ ] **3. Implement heading `CompletionProvider`**

  Create `src/completion/heading-completion-provider.ts`. Triggered after `[[doc#`:
  1. Extract `targetStem` from the prefix (text between `[[` and `#`)
  2. Resolve the target document via `Oracle`
  3. If resolved: enumerate all `HeadingEntry[]` from that doc's `OFMIndex`
  4. Return `CompletionItem[]`:

     ```typescript
     {
       label: heading.text,
       kind: CompletionItemKind.Reference,
       detail: `## ${heading.text} (${heading.level})`,
       insertText: heading.text,
     }
     ```

  5. Filter by `headingPrefix` if user has typed partial heading text

- [ ] **4. Implement callout type `CompletionProvider`**

  Create `src/completion/callout-completion-provider.ts`. Triggered after `> [!`:
  - The 13 standard callout types are hardcoded (not from VaultIndex)
  - Also include any custom types found in vault documents (extracted from `CalloutEntry[]` across all `OFMDoc`s)
  - Return `CompletionItem[]` with `kind: CompletionItemKind.EnumMember`
  - Inserting a callout type also inserts the `]` closing bracket and a space

  Standard types:

  ```typescript
  export const STANDARD_CALLOUT_TYPES = [
    'NOTE', 'INFO', 'TIP', 'WARNING', 'DANGER',
    'SUCCESS', 'QUESTION', 'FAILURE', 'BUG', 'EXAMPLE',
    'QUOTE', 'ABSTRACT', 'TODO',
  ] as const;
  ```

- [ ] **5. Implement embed `CompletionProvider`**

  Create `src/completion/embed-completion-provider.ts`. Triggered after `![[`:
  - Combine: all document stems (from `FolderLookup`) + all asset paths (from `AssetIndex`)
  - Documents: `kind: CompletionItemKind.File`
  - Assets: `kind: CompletionItemKind.File`, `detail`: vault-relative path
  - Apply `completion.candidates` cap

- [ ] **6. Implement `completion.candidates` cap with `isIncomplete`**

  In `CompletionRouter`: after each sub-provider returns items, check the count against the configured `completion.candidates` limit (default 50):
  - If `items.length > limit`, slice to `limit` and set `isIncomplete: true`
  - If `items.length <= limit`, set `isIncomplete: false`

- [ ] **7. Implement `linkStyle` formatting in completion insert texts**

  Each completion item's `insertText` depends on the configured `linkStyle`:
  - `file-stem`: insert stem only (e.g., `alpha`)
  - `title-slug`: insert frontmatter `title` if present, else stem
  - `file-path-stem`: insert vault-relative path without extension (e.g., `notes/alpha`)

  The `CompletionRouter` injects the current `linkStyle` from config into each sub-provider.

- [ ] **8. Implement intra-document heading completion after `[[#`**

  After `[[#` (no target document specified):
  - Enumerate headings in the **current** document
  - Return `CompletionItem[]` for intra-doc heading refs
  - These resolve as `[[#Heading Text]]`

- [ ] **9. Implement intra-document block ref completion after `[[#^`**

  After `[[#^` (no target document specified):
  - Enumerate block anchors in the **current** document
  - Return `CompletionItem[]` for intra-doc block refs

- [ ] **10. Register updated capabilities**

  Update `InitializeResult.capabilities.completionProvider`:

  ```typescript
  {
    triggerCharacters: ['[', '!', '#', '>'],
    allCommitCharacters: [']'],
    resolveProvider: false,
  }
  ```

---

## Gate Verification

```bash
bun run bdd -- features/completions.feature
```

---

## References

- `[[concepts/completion-architecture]]`
- `[[plans/phase-10-navigation]]`
