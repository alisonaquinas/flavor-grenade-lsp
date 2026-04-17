import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { DocId } from './doc-id.js';
import type { VaultIndex } from './vault-index.js';

/**
 * Provides fast stem-based and path-qualified document lookup over the vault.
 *
 * Must be rebuilt via {@link rebuild} whenever the {@link VaultIndex} changes.
 * Backed by a `Map<stem, DocId[]>` — no trie required for Phase 4 scale.
 */
@Injectable()
export class FolderLookup {
  private stemMap = new Map<string, DocId[]>();

  /**
   * Rebuild the internal stem map from current vault index contents.
   *
   * @param index - The current vault index to build from.
   */
  rebuild(index: VaultIndex): void {
    this.stemMap = new Map<string, DocId[]>();
    for (const [docId] of index.entries()) {
      const stem = this.extractStem(docId);
      const existing = this.stemMap.get(stem);
      if (existing !== undefined) {
        existing.push(docId);
      } else {
        this.stemMap.set(stem, [docId]);
      }
    }
  }

  /**
   * Return all DocIds whose last path segment (without extension) matches `stem`.
   *
   * @param stem - The bare filename without extension or path separators.
   */
  lookupByStem(stem: string): DocId[] {
    return this.stemMap.get(stem) ?? [];
  }

  /**
   * Return all DocIds where the full docId ends with `pathFragment`.
   *
   * This allows path-qualified lookups like `'notes/plan'` to disambiguate
   * when multiple documents share the same stem.
   *
   * @param pathFragment - A trailing path fragment to match against.
   */
  lookupByPath(pathFragment: string): DocId[] {
    const results: DocId[] = [];
    for (const [docId] of this.stemMap.values().flatMap((ids) => ids.map((id) => [id] as [DocId]))) {
      if (docId === pathFragment || docId.endsWith(`/${pathFragment}`)) {
        results.push(docId);
      }
    }
    return results;
  }

  private extractStem(docId: DocId): string {
    const segments = docId.split('/');
    return segments[segments.length - 1];
  }
}
