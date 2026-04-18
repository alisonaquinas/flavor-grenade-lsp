import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import type { WikiLinkEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex } from '../vault/vault-index.js';
import { Oracle } from './oracle.js';
import type { Ref, DefKey, CrossBlockRef } from './ref-graph.js';
import { RefGraph } from './ref-graph.js';

/**
 * Resolves individual wiki-link entries to Ref objects.
 *
 * Delegates all resolution logic to {@link Oracle}. For wiki-links with a
 * `blockRef`, also creates a {@link CrossBlockRef} and registers it with the
 * {@link RefGraph}.
 */
@Injectable()
export class LinkResolver {
  constructor(
    private readonly oracle: Oracle,
    @Optional() private readonly vaultIndex?: VaultIndex,
    @Optional() private readonly refGraph?: RefGraph,
  ) {}

  /**
   * Resolve a single wiki-link entry from a source document.
   *
   * When `entry.blockRef` is set:
   * - If `entry.target` is empty → intra-document block ref
   * - Otherwise → cross-document block ref
   *
   * @param entry       - The parsed wiki-link entry.
   * @param sourceDocId - DocId of the document containing the link.
   * @returns A {@link Ref} with resolvedTo set to the target DocId, or null.
   */
  resolveLink(entry: WikiLinkEntry, sourceDocId: DocId): Ref {
    if (entry.blockRef !== undefined) {
      return this.resolveLinkWithBlockRef(entry, sourceDocId);
    }
    const result = this.oracle.resolve(entry.target, entry.heading);
    const resolvedTo: DefKey | null = result.kind === 'resolved' ? result.targetDocId : null;
    return { sourceDocId, entry, resolvedTo };
  }

  private resolveLinkWithBlockRef(entry: WikiLinkEntry, sourceDocId: DocId): Ref {
    const anchorId = entry.blockRef!;

    if (entry.target === '') {
      // Intra-document block ref [[#^id]]
      const sourceDoc = this.vaultIndex?.get(sourceDocId);
      const resolvedAnchor =
        sourceDoc?.index.blockAnchors.find((a) => a.id === anchorId) ?? null;
      if (this.refGraph !== undefined) {
        const crossRef: CrossBlockRef = {
          sourceDocId,
          targetDocId: null,
          anchorId,
          entry,
          resolvedAnchor,
          diagnostic: resolvedAnchor === null ? 'FG005' : null,
        };
        this.refGraph.addBlockRef(crossRef);
      }
      // Intra-doc refs don't resolve to a separate document
      return { sourceDocId, entry, resolvedTo: null };
    }

    // Cross-document block ref [[target#^id]]
    const result = this.oracle.resolve(entry.target);
    const resolvedTo: DefKey | null = result.kind === 'resolved' ? result.targetDocId : null;

    if (result.kind === 'resolved' && this.refGraph !== undefined) {
      const targetDocId = result.targetDocId;
      const targetDoc = this.vaultIndex?.get(targetDocId);
      const resolvedAnchor =
        targetDoc?.index.blockAnchors.find((a) => a.id === anchorId) ?? null;
      const crossRef: CrossBlockRef = {
        sourceDocId,
        targetDocId,
        anchorId,
        entry,
        resolvedAnchor,
        diagnostic: resolvedAnchor === null ? 'FG005' : null,
      };
      this.refGraph.addBlockRef(crossRef);
    }

    return { sourceDocId, entry, resolvedTo };
  }
}
