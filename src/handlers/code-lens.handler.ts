import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import type { Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import { RefGraph } from '../resolution/ref-graph.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { DocId } from '../vault/doc-id.js';
import { normaliseFileUri } from './uri-utils.js';

/** A code lens item as defined by the LSP specification. */
export interface CodeLens {
  range: Range;
  command?: {
    title: string;
    command: string;
    arguments?: unknown[];
  };
}

/** Parameters for a `textDocument/codeLens` request. */
interface CodeLensParams {
  textDocument: { uri: string };
}

/**
 * Handles `textDocument/codeLens` requests.
 *
 * Produces one code lens per heading in the requested document, showing the
 * number of vault-wide references that point to that heading anchor.
 */
@Injectable()
export class CodeLensHandler {
  constructor(
    private readonly parseCache: ParseCache,
    private readonly refGraph: RefGraph,
    @Optional() private readonly vaultIndex?: VaultIndex,
  ) {}

  /**
   * Handle a `textDocument/codeLens` request.
   *
   * @param params - LSP codeLens request parameters.
   * @returns Array of CodeLens items, one per heading.
   */
  handle(params: CodeLensParams): CodeLens[] {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return [];

    // Resolve vault-relative docId from URI via VaultIndex, then look up all
    // incoming refs to this document and filter by heading text for each lens.
    const resolvedDocId = this.resolveDocId(params.textDocument.uri);
    const allRefsToDoc = resolvedDocId !== null ? this.refGraph.getRefsTo(resolvedDocId) : [];

    return doc.index.headings.map((heading) => {
      // Count refs that target this specific heading (entry.heading matches)
      const count = allRefsToDoc.filter((ref) => ref.entry.heading === heading.text).length;

      return {
        range: heading.range,
        command: {
          title: `${count} reference${count === 1 ? '' : 's'}`,
          command: 'editor.action.findReferences',
        },
      };
    });
  }

  /**
   * Resolve the vault-relative DocId for a document URI.
   *
   * Iterates VaultIndex to find an entry whose `uri` matches, then returns
   * the corresponding DocId.  Falls back to null when VaultIndex is unavailable
   * or no entry matches.
   */
  private resolveDocId(uri: string): DocId | null {
    if (this.vaultIndex === undefined) return null;
    for (const [docId, doc] of this.vaultIndex.entries()) {
      if (doc.uri === uri) return docId;
    }
    // Normalised comparison (handle file:// vs file:/// differences on Windows)
    const normalUri = normaliseFileUri(uri);
    for (const [docId, doc] of this.vaultIndex.entries()) {
      if (normaliseFileUri(doc.uri) === normalUri) return docId;
    }
    return null;
  }
}
