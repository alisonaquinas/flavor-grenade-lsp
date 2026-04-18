import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import type { Location, Position } from 'vscode-languageserver-types';
import { RefGraph } from '../resolution/ref-graph.js';
import type { DefKey } from '../resolution/ref-graph.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { DocId } from '../vault/doc-id.js';
import { TagRegistry } from '../tags/tag-registry.js';
import { entityAtPosition } from './cursor-entity.js';

/** Parameters for a `textDocument/references` request. */
interface ReferencesParams {
  textDocument: { uri: string };
  position: Position;
  context: { includeDeclaration: boolean };
}

/**
 * Handles `textDocument/references` requests for vault documents.
 *
 * Uses {@link entityAtPosition} to determine the entity under the cursor and
 * delegates to the appropriate lookup strategy:
 *
 * - **tag** → all occurrences via TagRegistry
 * - **block-anchor** → all `[[..#^id]]` references via RefGraph
 * - **heading** → all `[[doc#Heading]]` references via RefGraph
 * - **wiki-link** → definition location of the target
 * - **default** → all wiki-links that point to this document via RefGraph
 */
@Injectable()
export class ReferencesHandler {
  constructor(
    private readonly refGraph: RefGraph,
    private readonly parseCache: ParseCache,
    @Optional() private readonly vaultIndex?: VaultIndex,
    @Optional() private readonly tagRegistry?: TagRegistry,
  ) {}

  /**
   * Handle a `textDocument/references` request.
   *
   * @param params - LSP references request parameters.
   * @returns Array of Locations where the entity is referenced.
   */
  handle(params: ReferencesParams): Location[] {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return [];

    const entity = entityAtPosition(doc, params.position);

    switch (entity.kind) {
      case 'tag': {
        if (this.tagRegistry === undefined) return [];
        const occs = this.tagRegistry.occurrences(entity.entry.tag);
        return occs.map((occ) => ({
          uri: this.docIdToUri(occ.docId, params.textDocument.uri),
          range: occ.range,
        }));
      }

      case 'block-anchor': {
        const sourceDocId = this.resolveDefKey(params.textDocument.uri) as DocId;
        const crossRefs = this.refGraph.getBlockRefsToAnchor(
          sourceDocId,
          entity.entry.id,
        );
        return crossRefs.map((ref) => ({
          uri: this.docIdToUri(ref.sourceDocId, params.textDocument.uri),
          range: ref.entry.range,
        }));
      }

      case 'heading': {
        // Look up all cross-vault references to this heading via RefGraph.
        // The defKey for a heading-targeting wiki-link resolves to the docId
        // (the oracle resolves [[doc#Heading]] to the doc's DocId).
        // We fall through to document-level references as the ref graph stores
        // refs by resolved DocId, not by heading. Heading-specific filtering
        // would require a separate index — for Phase 10 we return all refs to
        // the document and let the editor's UI surface them.
        const defKey = this.resolveDefKey(params.textDocument.uri);
        const refs = this.refGraph.getRefsTo(defKey);
        const locations: Location[] = [];

        if (params.context.includeDeclaration) {
          locations.push({
            uri: params.textDocument.uri,
            range: entity.entry.range,
          });
        }

        for (const ref of refs) {
          // Only include refs that reference this specific heading
          if (ref.entry.heading === entity.entry.text) {
            locations.push({
              uri: this.docIdToUri(ref.sourceDocId as DocId, params.textDocument.uri),
              range: ref.entry.range,
            });
          }
        }

        return locations;
      }

      case 'wiki-link': {
        // For a wiki-link token, return references to the linked document
        // (i.e., all places that link to the same target document)
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
          locations.push({
            uri: this.docIdToUri(ref.sourceDocId as DocId, params.textDocument.uri),
            range: ref.entry.range,
          });
        }

        return locations;
      }

      default: {
        // Document-level: return all wiki-links that resolve to this document
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
          locations.push({
            uri: this.docIdToUri(ref.sourceDocId as DocId, params.textDocument.uri),
            range: ref.entry.range,
          });
        }

        return locations;
      }
    }
  }

  /**
   * Determine the DefKey for a URI by matching it against vault index entries.
   *
   * Resolution order:
   * 1. Exact URI match in vault index.
   * 2. Normalised URI comparison (handle two-slash vs three-slash file URIs on
   *    Windows, case-insensitive drive letters).
   * 3. Filename-stem match against vault index DocIds.
   * 4. Full-path fallback (least likely to match refGraph keys).
   */
  private resolveDefKey(uri: string): DefKey {
    if (this.vaultIndex !== undefined) {
      // Pass 1: exact URI match
      for (const [docId, indexDoc] of this.vaultIndex.entries()) {
        if (indexDoc.uri === uri) return docId as DefKey;
      }

      // Pass 2: normalised URI match (file:// vs file:///)
      const normalUri = this.normaliseFileUri(uri);
      for (const [docId, indexDoc] of this.vaultIndex.entries()) {
        if (this.normaliseFileUri(indexDoc.uri) === normalUri) return docId as DefKey;
      }

      // Pass 3: stem match — try to find a DocId whose last segment matches
      // the filename stem extracted from the URI
      const stem = this.uriToStem(uri);
      if (stem !== null) {
        for (const [docId] of this.vaultIndex.entries()) {
          const docStem = (docId as string).split('/').pop() ?? '';
          if (docStem === stem) return docId as DefKey;
        }
      }
    }
    return this.uriToFallbackDefKey(uri);
  }

  /**
   * Normalise a `file://` URI for comparison: lowercase drive letter (Windows),
   * collapse `///` to `//`, decode percent-encoding.
   */
  private normaliseFileUri(uri: string): string {
    return uri
      .replace(/^file:\/\/\/([A-Za-z]:)/, (_, d: string) => `file://${d.toLowerCase()}:`)
      .replace(/^file:\/\/([A-Za-z]:)/, (_, d: string) => `file://${d.toLowerCase()}:`)
      .toLowerCase();
  }

  /**
   * Extract the filename stem (no extension, no path prefix) from a URI.
   * Returns null if the URI cannot be parsed.
   */
  private uriToStem(uri: string): string | null {
    try {
      const pathname = new URL(uri).pathname;
      const decoded = decodeURIComponent(pathname);
      const base = decoded.split('/').pop() ?? '';
      return base.endsWith('.md') ? base.slice(0, -3) : base || null;
    } catch {
      return null;
    }
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
    if (this.vaultIndex !== undefined) {
      const sourceDoc = this.vaultIndex.get(sourceDocId);
      if (sourceDoc !== undefined) return sourceDoc.uri;
    }

    try {
      const pathname = new URL(referenceUri).pathname;
      const decoded = decodeURIComponent(pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const normalized = decoded.replace(/\\/g, '/');
      const parts = normalized.split('/');
      parts.pop();
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
