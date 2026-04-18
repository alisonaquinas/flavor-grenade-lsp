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
          const absPath = fromDocId(vaultRoot, resolution.targetDocId);
          return { uri: pathToFileURL(absPath).toString(), range: zeroRange() };
        } else if (resolution.kind === 'asset') {
          return { uri: pathToFileURL(resolution.assetPath).href, range: zeroRange() };
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
        const absPath = fromDocId(vaultRoot, candidateDocId as DocId);
        return {
          originSelectionRange: wikiEntry.range,
          targetUri: pathToFileURL(absPath).toString(),
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
          const absPath = fromDocId(vaultRoot, result.targetDocId);
          return { uri: pathToFileURL(absPath).toString(), range: heading.range };
        }
      }
    }

    const absPath = fromDocId(vaultRoot, result.targetDocId);
    return { uri: pathToFileURL(absPath).toString(), range: zeroRange() };
  }

  private resolveBlockRefDefinition(
    entry: WikiLinkEntry,
    sourceUri: string,
    vaultRoot: string,
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
    const absPath = fromDocId(vaultRoot, result.targetDocId);
    return { uri: pathToFileURL(absPath).toString(), range: anchor.range };
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
}
