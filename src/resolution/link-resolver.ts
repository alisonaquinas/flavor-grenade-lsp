import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { WikiLinkEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { Oracle } from './oracle.js';
import type { Ref, DefKey } from './ref-graph.js';

/**
 * Resolves individual wiki-link entries to Ref objects.
 *
 * Delegates all resolution logic to {@link Oracle}.
 */
@Injectable()
export class LinkResolver {
  constructor(private readonly oracle: Oracle) {}

  /**
   * Resolve a single wiki-link entry from a source document.
   *
   * @param entry      - The parsed wiki-link entry.
   * @param sourceDocId - DocId of the document containing the link.
   * @returns A {@link Ref} with resolvedTo set to the target DocId, or null.
   */
  resolveLink(entry: WikiLinkEntry, sourceDocId: DocId): Ref {
    const result = this.oracle.resolve(entry.target, entry.heading, entry.blockRef);
    const resolvedTo: DefKey | null = result.kind === 'resolved' ? result.targetDocId : null;
    return { sourceDocId, entry, resolvedTo };
  }
}
