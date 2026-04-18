import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import type { Location, Position } from 'vscode-languageserver-types';
import { RefGraph } from '../resolution/ref-graph.js';
import type { DefKey } from '../resolution/ref-graph.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { DocId } from '../vault/doc-id.js';

/** Parameters for a `textDocument/references` request. */
interface ReferencesParams {
  textDocument: { uri: string };
  position: Position;
  context: { includeDeclaration: boolean };
}

/**
 * Handles `textDocument/references` requests for vault documents.
 *
 * Uses the {@link RefGraph} to find all wiki-links that resolve to the
 * document corresponding to the requested URI.
 */
@Injectable()
export class ReferencesHandler {
  constructor(
    private readonly refGraph: RefGraph,
    private readonly parseCache: ParseCache,
    @Optional() private readonly vaultIndex?: VaultIndex,
  ) {}

  /**
   * Handle a `textDocument/references` request.
   *
   * @param params - LSP references request parameters.
   * @returns Array of Locations where the target document is referenced.
   */
  handle(params: ReferencesParams): Location[] {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return [];

    const defKey = this.resolveDefKey(params.textDocument.uri);
    const refs = this.refGraph.getRefsTo(defKey);

    const locations: Location[] = [];

    if (params.context.includeDeclaration) {
      locations.push({
        uri: params.textDocument.uri,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      });
    }

    for (const ref of refs) {
      const sourceUri = this.docIdToUri(ref.sourceDocId as DocId, params.textDocument.uri);
      locations.push({
        uri: sourceUri,
        range: ref.entry.range,
      });
    }

    return locations;
  }

  /**
   * Determine the DefKey for a URI by matching it against vault index entries.
   *
   * Falls back to a best-effort URI-to-path derivation if vault index is not
   * available.
   */
  private resolveDefKey(uri: string): DefKey {
    if (this.vaultIndex !== undefined) {
      for (const [docId, indexDoc] of this.vaultIndex.entries()) {
        if (indexDoc.uri === uri) return docId as DefKey;
      }
    }
    return this.uriToFallbackDefKey(uri);
  }

  private uriToFallbackDefKey(uri: string): DefKey {
    try {
      const pathname = new URL(uri).pathname;
      const decoded = decodeURIComponent(pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const normalized = decoded.replace(/\\/g, '/');
      return normalized.endsWith('.md') ? normalized.slice(0, -3) : normalized;
    } catch {
      return uri;
    }
  }

  private docIdToUri(sourceDocId: DocId, referenceUri: string): string {
    // Look up the source document's URI in vault index (most accurate)
    if (this.vaultIndex !== undefined) {
      const sourceDoc = this.vaultIndex.get(sourceDocId);
      if (sourceDoc !== undefined) return sourceDoc.uri;
    }

    // Fallback: derive from the reference URI's vault root
    try {
      const pathname = new URL(referenceUri).pathname;
      const decoded = decodeURIComponent(pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const normalized = decoded.replace(/\\/g, '/');
      const parts = normalized.split('/');
      // strip filename
      parts.pop();
      // find vault root by trimming depth equal to DocId depth
      const docSegments = (sourceDocId as string).split('/');
      const depth = docSegments.length;
      const vaultParts = parts.slice(0, parts.length - depth + 1);
      const absPath = [...vaultParts, ...docSegments].join('/') + '.md';
      return `file://${absPath}`;
    } catch {
      return `file:///${sourceDocId}.md`;
    }
  }
}
