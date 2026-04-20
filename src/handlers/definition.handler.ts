import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import type { Position, Location, LocationLink } from 'vscode-languageserver-types';
import { pathToFileURL } from 'url';
import { Oracle } from '../resolution/oracle.js';
import { EmbedResolver } from '../resolution/embed-resolver.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { WikiLinkEntry } from '../parser/types.js';
import { fromDocId } from '../vault/doc-id.js';
import { entityAtPosition } from './cursor-entity.js';
import type { DocId } from '../vault/doc-id.js';

/** Parameters for a `textDocument/definition` request. */
interface DefinitionParams {
  textDocument: { uri: string };
  position: Position;
}

/** A zero-width range at the start of a document. */
function zeroRange(): Location['range'] {
  return { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
}

/**
 * Handles `textDocument/definition` requests.
 *
 * Resolves the entity under the cursor using {@link entityAtPosition} and
 * returns the appropriate definition location:
 *
 * - wiki-link `[[target]]` → target doc at line 0
 * - wiki-link `[[target#heading]]` → heading range in target doc
 * - wiki-link `[[target#^blockid]]` → block anchor range in target doc
 * - wiki-link `[[#heading]]` → heading in current doc
 * - wiki-link `[[#^blockid]]` → block anchor in current doc
 * - embed `![[embed]]` → embed target location
 * - tag `#tag` → first occurrence of the tag
 * - ambiguous link → `LocationLink[]` (one per candidate)
 * - plain text → null
 */
@Injectable()
export class DefinitionHandler {
  constructor(
    private readonly oracle: Oracle,
    private readonly embedResolver: EmbedResolver,
    private readonly parseCache: ParseCache,
    @Optional() private readonly vaultIndex?: VaultIndex,
  ) {}

  /**
   * Handle a `textDocument/definition` request.
   *
   * @param params - LSP definition request parameters.
   * @returns Target Location, LocationLink[], or null if not resolvable.
   */
  handle(params: DefinitionParams): Location | LocationLink[] | null {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return null;

    const vaultRoot = this.extractVaultRoot(params.textDocument.uri);
    const entity = entityAtPosition(doc, params.position);

    switch (entity.kind) {
      case 'wiki-link':
        return this.resolveWikiLinkDefinition(entity.entry, doc.uri, vaultRoot);

      case 'embed': {
        const resolution = this.embedResolver.resolve(entity.entry);
        if (resolution.kind === 'markdown') {
          const targetUri = this.docIdToUri(resolution.targetDocId, vaultRoot);
          // If the embed targets a specific block anchor, navigate to it
          if (resolution.blockTarget !== undefined && this.vaultIndex !== undefined) {
            const targetDoc = this.vaultIndex.get(resolution.targetDocId);
            if (targetDoc !== undefined) {
              const anchor = targetDoc.index.blockAnchors.find(
                (a) => a.id === resolution.blockTarget,
              );
              if (anchor !== undefined) {
                return { uri: targetUri, range: anchor.range };
              }
            }
          }
          // If the embed targets a specific heading, navigate to it
          if (resolution.headingTarget !== undefined && this.vaultIndex !== undefined) {
            const targetDoc = this.vaultIndex.get(resolution.targetDocId);
            if (targetDoc !== undefined) {
              const heading = targetDoc.index.headings.find(
                (h) => h.text === resolution.headingTarget,
              );
              if (heading !== undefined) {
                return { uri: targetUri, range: heading.range };
              }
            }
          }
          return { uri: targetUri, range: zeroRange() };
        } else if (resolution.kind === 'asset') {
          // Construct absolute URI from vault root + vault-relative asset path
          const assetUri = this.assetPathToUri(resolution.assetPath);
          return { uri: assetUri, range: zeroRange() };
        }
        return null;
      }

      case 'tag': {
        // Go to first occurrence of the tag in the vault
        if (this.vaultIndex === undefined) return null;
        const tagStr = entity.entry.tag;
        for (const [, indexDoc] of this.vaultIndex.entries()) {
          for (const tagEntry of indexDoc.index.tags) {
            if (tagEntry.tag === tagStr) {
              return { uri: indexDoc.uri, range: tagEntry.range };
            }
          }
        }
        return null;
      }

      default:
        return null;
    }
  }

  private resolveWikiLinkDefinition(
    wikiEntry: WikiLinkEntry,
    sourceUri: string,
    vaultRoot: string,
  ): Location | LocationLink[] | null {
    if (wikiEntry.blockRef !== undefined) {
      return this.resolveBlockRefDefinition(wikiEntry, sourceUri, vaultRoot);
    }

    // Intra-document heading reference [[#heading]]
    if (wikiEntry.target === '' && wikiEntry.heading !== undefined) {
      const sourceDoc = this.parseCache.get(sourceUri);
      if (sourceDoc === undefined) return null;
      const heading = sourceDoc.index.headings.find((h) => h.text === wikiEntry.heading);
      if (heading === undefined) return null;
      return { uri: sourceUri, range: heading.range };
    }

    const result = this.oracle.resolve(wikiEntry.target, wikiEntry.heading);

    if (result.kind === 'ambiguous') {
      // TASK-106: return LocationLink[] for each candidate
      return result.candidates.map((candidateDocId) => {
        const targetUri = this.docIdToUri(candidateDocId as DocId, vaultRoot);
        return {
          originSelectionRange: wikiEntry.range,
          targetUri,
          targetRange: zeroRange(),
          targetSelectionRange: zeroRange(),
        } satisfies LocationLink;
      });
    }

    if (result.kind !== 'resolved') return null;

    // Heading-fragment link [[target#heading]]
    if (wikiEntry.heading !== undefined && this.vaultIndex !== undefined) {
      const targetDoc = this.vaultIndex.get(result.targetDocId);
      if (targetDoc !== undefined) {
        const heading = targetDoc.index.headings.find((h) => h.text === wikiEntry.heading);
        if (heading !== undefined) {
          return { uri: targetDoc.uri, range: heading.range };
        }
      }
    }

    return { uri: this.docIdToUri(result.targetDocId, vaultRoot), range: zeroRange() };
  }

  private resolveBlockRefDefinition(
    entry: WikiLinkEntry,
    sourceUri: string,
    _vaultRoot: string,
  ): Location | null {
    const anchorId = entry.blockRef!;

    if (entry.target === '') {
      // Intra-document block ref [[#^id]]: anchor lives in the source doc
      const sourceDoc = this.parseCache.get(sourceUri);
      if (sourceDoc === undefined) return null;
      const anchor = sourceDoc.index.blockAnchors.find((a) => a.id === anchorId);
      if (anchor === undefined) return null;
      return { uri: sourceUri, range: anchor.range };
    }

    // Cross-document block ref [[target#^id]]
    const result = this.oracle.resolve(entry.target);
    if (result.kind !== 'resolved') return null;
    if (this.vaultIndex === undefined) return null;
    const targetDoc = this.vaultIndex.get(result.targetDocId);
    if (targetDoc === undefined) return null;
    const anchor = targetDoc.index.blockAnchors.find((a) => a.id === anchorId);
    if (anchor === undefined) return null;
    return { uri: targetDoc.uri, range: anchor.range };
  }

  /**
   * Resolve a DocId to a URI, preferring the VaultIndex URI over reconstruction.
   * Falls back to reconstructing from the vault root path when VaultIndex is unavailable.
   */
  private docIdToUri(docId: DocId, vaultRoot: string): string {
    if (this.vaultIndex) {
      const doc = this.vaultIndex.get(docId);
      if (doc) return doc.uri;
    }
    return pathToFileURL(fromDocId(vaultRoot, docId)).toString();
  }

  /**
   * Extract a best-effort vault root from a document URI.
   */
  private extractVaultRoot(uri: string): string {
    try {
      const pathname = new URL(uri).pathname;
      const decoded = decodeURIComponent(pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const parts = decoded.replace(/\\/g, '/').split('/');
      parts.pop();
      return parts.join('/');
    } catch {
      return '/';
    }
  }

  /**
   * Convert a vault-relative asset path to an absolute URI.
   *
   * Derives the vault root URI from the first entry in the vault index, then
   * appends the vault-relative asset path.  Falls back to pathToFileURL when
   * the vault index is empty or unavailable.
   *
   * @param assetPath - Vault-relative path such as `assets/image.png`.
   */
  private assetPathToUri(assetPath: string): string {
    if (this.vaultIndex !== undefined) {
      for (const [docId, doc] of this.vaultIndex.entries()) {
        const docSuffix = '/' + (docId as string) + '.md';
        if (doc.uri.endsWith(docSuffix)) {
          const vaultRootUri = doc.uri.slice(0, doc.uri.length - docSuffix.length);
          return vaultRootUri + '/' + assetPath;
        }
      }
    }
    return pathToFileURL(assetPath).href;
  }
}
