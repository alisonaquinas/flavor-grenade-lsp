---
title: "Phase 6: Tags"
phase: 6
status: planned
tags: [tags, indexing, completion, find-references, code-actions]
updated: 2026-04-16
---

# Phase 6: Tags

| Field      | Value |
|------------|-------|
| Phase      | 6 |
| Title      | Tags |
| Status     | ⏳ planned |
| Gate       | `bdd/features/tags.feature` all scenarios pass |
| Depends on | Phase 5 (Wiki-Link Resolution) |

---

## Objective

Build the tag subsystem: vault-wide tag registry, tag hierarchy, inline completion, find-references across the vault, and a code action to migrate inline tags into YAML frontmatter.

---

## Task List

- [ ] **1. Implement `TagRegistry` — vault-wide tag index**

  Create `src/tags/tag-registry.ts`. A flat index mapping tag strings to their source locations:

  ```typescript
  export interface TagOccurrence {
    docId: DocId;
    range: Range;
    source: 'inline' | 'frontmatter';
  }

  export class TagRegistry {
    /** Rebuild from all OFMDocs in VaultIndex */
    rebuild(vaultIndex: VaultIndex): void;

    /** All occurrences of a specific tag (exact match) */
    occurrences(tag: string): TagOccurrence[];

    /** All known tags (deduplicated) */
    allTags(): string[];

    /** All tags that start with a given prefix */
    withPrefix(prefix: string): string[];

    /** Parent tags of a nested tag (e.g., "#project" for "#project/active") */
    parentOf(tag: string): string[];
  }
  ```

- [ ] **2. Build tag index during vault scan**

  During `VaultScanner` initial scan and on `FileWatcher` events, call `TagRegistry.rebuild()` or do incremental updates per document. For incremental: remove all occurrences for a changed `DocId`, then add back from the new `OFMDoc`.

- [ ] **3. Implement tag `CompletionProvider`**

  Create `src/completion/tag-completion-provider.ts`. Triggered by `#` character:
  1. Query `TagRegistry.allTags()` for all known tags
  2. Strip the leading `#` from each (client supplies the `#` as trigger)
  3. Return `CompletionItem[]` with `kind: CompletionItemKind.Value` (= 12)
  4. Sort by frequency of occurrence (most-used first)
  5. Apply `completion.candidates` cap

- [ ] **4. Implement find-references for tags**

  Update `ReferencesService` (from Phase 5) to handle cursor on a `#tag`:
  1. Identify the tag string at cursor position (from OFMIndex)
  2. Call `TagRegistry.occurrences(tag)` to get all vault-wide occurrences
  3. Map each occurrence to a `Location`
  4. Return all locations (do NOT include parent-tag occurrences unless explicitly requested)

- [ ] **5. Implement tag hierarchy queries**

  Add `TagRegistry.hierarchy()` method that returns the tag tree:

  ```typescript
  export interface TagNode {
    tag: string;       // e.g., "project"
    fullTag: string;   // e.g., "#project"
    children: TagNode[];
    occurrenceCount: number;
  }

  hierarchy(): TagNode[];
  ```

  Used by the workspace symbol provider (Phase 12).

- [ ] **6. Implement "Move tag to frontmatter" code action**

  Create `src/code-actions/tag-to-yaml.action.ts`. When cursor is on an inline `#tag`:
  1. Offer code action: "Move #tag to frontmatter"
  2. The `WorkspaceEdit`:
     a. Delete the inline `#tag` span from the document body
     b. If frontmatter exists with `tags:` key, append the tag value
     c. If frontmatter exists without `tags:`, add `tags: [tag]`
     d. If no frontmatter, prepend `---\ntags: [tag]\n---\n` to document

- [ ] **7. Handle YAML frontmatter tags in `TagRegistry`**

  During `OFMDoc` construction, `FrontmatterParser` already extracts `frontmatter.tags`. In `TagRegistry.rebuild()`, also process frontmatter tags with `source: 'frontmatter'`. The range for frontmatter tags points to the line within the frontmatter block.

- [ ] **8. Write unit tests for `TagRegistry`**

  Test file: `src/tags/__tests__/tag-registry.test.ts`. Test cases:
  - Inline tag indexed with correct location
  - Frontmatter tag indexed with correct location
  - Tag inside code block NOT indexed
  - Tag inside math block NOT indexed
  - Nested tag hierarchy built correctly
  - `withPrefix()` returns correct subset

---

## Gate Verification

```bash
bun test src/tags/
bun run bdd -- features/tags.feature
```

---

## References

- `[[ofm-spec/tags]]`
- `[[ddd/tags/domain-model]]`
- `[[plans/phase-07-embeds]]`
