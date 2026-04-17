---
title: "Phase 7: Embeds"
phase: 7
status: planned
tags: [embeds, resolution, diagnostics, navigation, hover]
updated: 2026-04-16
---

# Phase 7: Embeds

| Field      | Value |
|------------|-------|
| Phase      | 7 |
| Title      | Embeds |
| Status     | ⏳ planned |
| Gate       | `bdd/features/embeds.feature` all scenarios pass |
| Depends on | Phase 5 (Wiki-Link Resolution) |

---

## Objective

Extend the `RefGraph` and `LinkResolver` to handle `![[embed]]` syntax. Embeds behave similarly to wiki-links but use `FG004` (not FG001) for broken references, resolve to non-markdown files (images, PDFs), support heading and block-anchor sub-targets, and support a size-specifier syntax (`|200` or `|200x150`).

---

## Task List

- [ ] **1. Add `EmbedRef` to `RefGraph`**

  Update `src/resolution/ref-graph.ts` to track embed entries separately from wiki-link entries. The `EmbedRef` shares the same `DefKey` format but has an additional `embedSize` field:

  ```typescript
  export interface EmbedRef {
    sourceDocId: DocId;
    entry: EmbedEntry;
    resolvedTo: DefKey | null;
    diagnostic?: 'FG004';
    embedSize?: { width?: number; height?: number };
  }
  ```

- [ ] **2. Implement `EmbedDest` resolution**

  Create `src/resolution/embed-resolver.ts`. An embed destination can be:
  - A markdown document (`.md`): same resolution as wiki-link via `Oracle`
  - A non-markdown file (image, PDF, audio, video): check existence on disk via `VaultIndex` asset index
  - A heading sub-target `![[doc#heading]]`: resolve doc first, then heading within that doc
  - A block sub-target `![[doc#^blockid]]`: resolve doc first, then block anchor

  For non-markdown files, the `VaultIndex` must track asset files separately from document files (scan all extensions, not just `.md`).

- [ ] **3. Add asset tracking to `VaultScanner`**

  Update `src/vault/vault-scanner.ts` to maintain an `AssetIndex` alongside the document index:

  ```typescript
  export class AssetIndex {
    has(vaultRelativePath: string): boolean;
    allPaths(): string[];
  }
  ```

  Assets are all files under the vault root that do NOT match the configured document extensions. Assets are indexed by their full vault-relative path (not stem-only like documents).

- [ ] **4. Implement FG004 diagnostic**

  Update `DiagnosticService` to emit FG004 for broken embeds:
  - **FG004 BrokenEmbed**: severity Warning; message = `Cannot resolve embed '![[target]]'`
  - Use Warning (not Error) because broken embeds are less critical than broken links
  - In single-file mode, FG004 is suppressed

- [ ] **5. Implement embed go-to-definition**

  Update `DefinitionService` to handle `![[embed]]` entries:
  - For markdown embeds: same as wiki-link definition — navigate to document (optionally to heading/block)
  - For image embeds: return the file URI of the asset (opens the file in the editor)
  - For heading embeds: navigate to the heading line in the target document
  - For block embeds: navigate to the block anchor line

- [ ] **6. Implement embed hover**

  Create `src/handlers/hover.handler.ts`. When cursor is on `![[embed]]`:
  - For markdown embeds: show the first 5 lines of the target document as hover content (Markdown)
  - For image embeds: show `![](uri)` as hover content (renders image in VS Code)
  - For heading embeds: show the heading text and first paragraph below it

  Register `hoverProvider: true` in capabilities.

- [ ] **7. Handle embed size syntax `![[image.png|200]]`**

  In `EmbedParser` (Phase 3), the `|200` part was parsed as a potential alias. In the embed resolver, distinguish size specifiers from aliases:
  - If the target has an image extension (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.bmp`) AND the pipe content matches `/^\d+(x\d+)?$/`, treat it as a size specifier
  - Otherwise treat it as a display alias (same as wiki-link pipe alias)

- [ ] **8. Write unit tests for embed resolution**

  Test file: `src/resolution/__tests__/embed-resolver.test.ts`. Test cases:
  - Markdown embed resolves to `OFMDoc`
  - Image embed resolves to asset path
  - Heading embed resolves to heading in target
  - Block embed resolves to block anchor in target
  - Missing markdown embed → FG004
  - Missing image → FG004
  - Existing image with size syntax → no diagnostic
  - Non-markdown, non-image file embed → resolves if exists in AssetIndex

---

## Gate Verification

```bash
bun test src/resolution/__tests__/embed-resolver.test.ts
bun run bdd -- features/embeds.feature
```

---

## References

- `[[ofm-spec/embeds]]`
- `[[ddd/resolution/domain-model]]`
- `[[plans/phase-08-block-refs]]`
