import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Position, Location } from 'vscode-languageserver-types';
import { pathToFileURL } from 'url';
import { Oracle } from '../resolution/oracle.js';
import { ParseCache } from '../parser/parser.module.js';
import type { WikiLinkEntry } from '../parser/types.js';
import { fromDocId } from '../vault/doc-id.js';

/** Parameters for a `textDocument/definition` request. */
interface DefinitionParams {
  textDocument: { uri: string };
  position: Position;
}

/**
 * Handles `textDocument/definition` requests for wiki-links.
 *
 * Finds the wiki-link token under the cursor, resolves it via Oracle,
 * and returns the target document's Location.
 */
@Injectable()
export class DefinitionHandler {
  constructor(
    private readonly oracle: Oracle,
    private readonly parseCache: ParseCache,
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

    const entry = this.findEntryAtPosition(doc.index.wikiLinks, params.position);
    if (entry === null) return null;

    const result = this.oracle.resolve(entry.target, entry.heading, entry.blockRef);
    if (result.kind !== 'resolved') return null;

    const absPath = fromDocId(this.extractVaultRoot(params.textDocument.uri), result.targetDocId);
    const uri = pathToFileURL(absPath).toString();

    return {
      uri,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
    };
  }

  private findEntryAtPosition(
    wikiLinks: WikiLinkEntry[],
    position: Position,
  ): WikiLinkEntry | null {
    for (const entry of wikiLinks) {
      if (this.positionInRange(position, entry)) return entry;
    }
    return null;
  }

  private positionInRange(position: Position, entry: WikiLinkEntry): boolean {
    const { start, end } = entry.range;
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
