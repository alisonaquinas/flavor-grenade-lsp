import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { WikiLinkEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex } from '../vault/vault-index.js';
import { Oracle } from './oracle.js';

/** Vault-relative path (DocId) used as the definition key for references. */
export type DefKey = string;

/** A resolved or unresolved reference from one document to another. */
export interface Ref {
  /** DocId of the document containing the wiki-link. */
  sourceDocId: DocId;
  /** The parsed wiki-link entry. */
  entry: WikiLinkEntry;
  /** Resolved target DocId, or null if broken/ambiguous/malformed. */
  resolvedTo: DefKey | null;
}

/**
 * Maintains a graph of all wiki-link references across the vault.
 *
 * Must be rebuilt after each vault scan or file change.
 */
@Injectable()
export class RefGraph {
  /** Map from DefKey (target) to all Refs pointing at it. */
  private refsToMap = new Map<DefKey, Ref[]>();
  /** All refs with resolvedTo === null (broken). */
  private unresolvedRefs: Ref[] = [];
  /** All refs that are ambiguous (resolvedTo === null, ambiguous resolution). */
  private ambiguousRefs: Ref[] = [];

  /**
   * Rebuild the reference graph from all documents in the vault index.
   *
   * @param index  - Current vault index.
   * @param oracle - Oracle used to resolve each wiki-link.
   */
  rebuild(index: VaultIndex, oracle: Oracle): void {
    this.refsToMap = new Map();
    this.unresolvedRefs = [];
    this.ambiguousRefs = [];

    oracle.invalidateAliasIndex();

    for (const [sourceDocId, doc] of index.entries()) {
      for (const entry of doc.index.wikiLinks) {
        const result = oracle.resolve(entry.target, entry.heading, entry.blockRef);
        const ref = this.buildRef(sourceDocId, entry, result);
        this.registerRef(ref, result);
      }
    }
  }

  /**
   * Get all references that resolve to the given definition key.
   *
   * @param defKey - Target DocId to look up references for.
   */
  getRefsTo(defKey: DefKey): Ref[] {
    return this.refsToMap.get(defKey) ?? [];
  }

  /** Get all references that could not be resolved (broken links). */
  getUnresolvedRefs(): Ref[] {
    return [...this.unresolvedRefs];
  }

  /** Get all references that resolved to multiple candidates (ambiguous links). */
  getAmbiguousRefs(): Ref[] {
    return [...this.ambiguousRefs];
  }

  private buildRef(
    sourceDocId: DocId,
    entry: WikiLinkEntry,
    result: ReturnType<Oracle['resolve']>,
  ): Ref {
    const resolvedTo = result.kind === 'resolved' ? result.targetDocId : null;
    return { sourceDocId, entry, resolvedTo };
  }

  private registerRef(ref: Ref, result: ReturnType<Oracle['resolve']>): void {
    if (result.kind === 'resolved') {
      const existing = this.refsToMap.get(result.targetDocId);
      if (existing !== undefined) {
        existing.push(ref);
      } else {
        this.refsToMap.set(result.targetDocId, [ref]);
      }
    } else if (result.kind === 'ambiguous') {
      this.ambiguousRefs.push(ref);
    } else {
      // broken or malformed
      this.unresolvedRefs.push(ref);
    }
  }
}
