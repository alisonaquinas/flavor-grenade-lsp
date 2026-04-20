import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { OFMDoc } from '../parser/types.js';
import type { DocId } from './doc-id.js';

/**
 * In-memory index mapping {@link DocId} keys to their parsed {@link OFMDoc}.
 *
 * Acts as the single source of truth for all vault documents currently known
 * to the server. Backed by a `Map` for O(1) set/get/delete/has.
 */
@Injectable()
export class VaultIndex {
  private readonly store = new Map<DocId, OFMDoc>();

  /**
   * Store or replace a document.
   *
   * @param id  - The document identifier.
   * @param doc - The parsed OFM document.
   */
  set(id: DocId, doc: OFMDoc): void {
    this.store.set(id, doc);
  }

  /**
   * Retrieve a document by id, or `undefined` if not found.
   *
   * @param id - The document identifier.
   */
  get(id: DocId): OFMDoc | undefined {
    return this.store.get(id);
  }

  /**
   * Remove a document from the index.
   *
   * @param id - The document identifier.
   */
  delete(id: DocId): void {
    this.store.delete(id);
  }

  /**
   * Returns `true` if the index contains an entry for `id`.
   *
   * @param id - The document identifier.
   */
  has(id: DocId): boolean {
    return this.store.has(id);
  }

  /** Iterate all stored {@link OFMDoc} values. */
  values(): IterableIterator<OFMDoc> {
    return this.store.values();
  }

  /** Iterate all `[DocId, OFMDoc]` entries. */
  entries(): IterableIterator<[DocId, OFMDoc]> {
    return this.store.entries();
  }

  /** Number of documents currently in the index. */
  size(): number {
    return this.store.size;
  }

  /** Remove all entries from the index. */
  clear(): void {
    this.store.clear();
  }
}
