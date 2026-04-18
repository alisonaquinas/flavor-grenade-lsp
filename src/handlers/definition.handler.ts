import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import type { Position, Location } from 'vscode-languageserver-types';
import { pathToFileURL } from 'url';
import { Oracle } from '../resolution/oracle.js';
import { EmbedResolver } from '../resolution/embed-resolver.js';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { WikiLinkEntry, EmbedEntry } from '../parser/types.js';
import { fromDocId } from '../vault/doc-id.js';

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
 * Handles `textDocument/definition` requests for wiki-links and embeds.
 *
 * Finds the wiki-link or embed token under the cursor, resolves it, and
 * returns the target document's Location.
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
   * @returns Target Location or null if not resolvable.
   */
  handle(params: DefinitionParams): Location | null {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return null;

    const vaultRoot = this.extractVaultRoot(params.textDocument.uri);

    // Check wiki-links first.
    const wikiEntry = this.findEntryAtPosition(doc.index.wikiLinks, params.position);
    if (wikiEntry !== null) {
      return this.resolveWikiLinkDefinition(wikiEntry, doc.uri, vaultRoot);
    }

    // Then check embed entries.
    const embedEntry = this.findEmbedAtPosition(doc.index.embeds, params.position);
    if (embedEntry !== null) {
      const resolution = this.embedResolver.resolve(embedEntry);
      if (resolution.kind === 'markdown') {
        const absPath = fromDocId(vaultRoot, resolution.targetDocId);
        return { uri: pathToFileURL(absPath).toString(), range: zeroRange() };
      } else if (resolution.kind === 'asset') {
        return { uri: pathToFileURL(resolution.assetPath).href, range: zeroRange() };
      }
      return null;
    }

    return null;
  }

  private resolveWikiLinkDefinition(
    wikiEntry: WikiLinkEntry,
    sourceUri: string,
    vaultRoot: string,
  ): Location | null {
    if (wikiEntry.blockRef !== undefined) {
      return this.resolveBlockRefDefinition(wikiEntry, sourceUri, vaultRoot);
    }
    const result = this.oracle.resolve(wikiEntry.target, wikiEntry.heading);
    if (result.kind !== 'resolved') return null;
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

  private findEntryAtPosition(
    wikiLinks: WikiLinkEntry[],
    position: Position,
  ): WikiLinkEntry | null {
    for (const entry of wikiLinks) {
      if (this.positionInRange(position, entry.range)) return entry;
    }
    return null;
  }

  private findEmbedAtPosition(
    embeds: EmbedEntry[],
    position: Position,
  ): EmbedEntry | null {
    for (const entry of embeds) {
      if (this.positionInRange(position, entry.range)) return entry;
    }
    return null;
  }

  private positionInRange(position: Position, range: WikiLinkEntry['range']): boolean {
    const { start, end } = range;
    if (position.line < start.line || position.line > end.line) return false;
    if (position.line === start.line && position.character < start.character) return false;
    if (position.line === end.line && position.character > end.character) return false;
    return true;
  }

  /**
   * Extract a best-effort vault root from a document URI.
   *
   * This is used only to reconstruct the absolute path for the target.
   * The actual vault root determination is handled by VaultDetector in
   * full-server mode; this fallback just uses the URI's parent directory.
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
