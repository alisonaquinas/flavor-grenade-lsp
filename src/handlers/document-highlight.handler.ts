import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Position, Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import { VaultIndex } from '../vault/vault-index.js';
import { entityAtPosition } from './cursor-entity.js';

/**
 * A document highlight item as defined by the LSP specification.
 *
 * kind: 1 = Text, 2 = Read, 3 = Write
 */
export interface DocumentHighlight {
  range: Range;
  kind?: 1 | 2 | 3;
}

/** Parameters for a `textDocument/documentHighlight` request. */
interface DocumentHighlightParams {
  textDocument: { uri: string };
  position: Position;
}

/**
 * Handles `textDocument/documentHighlight` requests.
 *
 * Given the entity under the cursor, highlights related occurrences within
 * the same document:
 *
 * - **heading**: Write on the heading line + Read on every `[[#heading]]`
 *   intra-document link that references it.
 * - **block-anchor**: Write on the anchor token + Read on every `[[#^id]]`
 *   intra-document link that references it.
 * - **wiki-link**: Read on every occurrence of the same link target text in
 *   the current document.
 * - **other entities / plain text**: empty list.
 */
@Injectable()
export class DocumentHighlightHandler {
  constructor(
    private readonly parseCache: ParseCache,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Handle a `textDocument/documentHighlight` request.
   *
   * @param params - LSP documentHighlight request parameters.
   * @returns Array of DocumentHighlight items within the current document.
   */
  handle(params: DocumentHighlightParams): DocumentHighlight[] {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return [];

    const entity = entityAtPosition(doc, params.position);

    switch (entity.kind) {
      case 'heading': {
        const headingText = entity.entry.text;
        const highlights: DocumentHighlight[] = [
          { range: entity.entry.range, kind: 3 }, // Write: heading definition
        ];

        // Read: intra-document links that reference this heading (target === '')
        for (const link of doc.index.wikiLinks) {
          if (link.target === '' && link.heading === headingText) {
            highlights.push({ range: link.range, kind: 2 });
          }
        }

        return highlights;
      }

      case 'block-anchor': {
        const anchorId = entity.entry.id;
        const highlights: DocumentHighlight[] = [
          { range: entity.entry.range, kind: 3 }, // Write: anchor definition
        ];

        // Read: intra-document block ref links (target === '')
        for (const link of doc.index.wikiLinks) {
          if (link.target === '' && link.blockRef === anchorId) {
            highlights.push({ range: link.range, kind: 2 });
          }
        }

        return highlights;
      }

      case 'wiki-link': {
        const target = entity.entry.target;
        // Read: all occurrences of the same link target in the current doc
        return doc.index.wikiLinks
          .filter((link) => link.target === target)
          .map((link) => ({ range: link.range, kind: 2 as const }));
      }

      default:
        return [];
    }
  }
}
