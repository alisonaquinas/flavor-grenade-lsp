import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import { RefGraph } from '../resolution/ref-graph.js';

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

    // Derive the DocId for this document from VaultIndex lookup fallback.
    // The defKey for a heading is `<docId>#<headingText>`.
    const docId = this.uriToDocId(params.textDocument.uri);

    return doc.index.headings.map((heading) => {
      const defKey = `${docId}#${heading.text}`;
      const count = this.refGraph.getRefsTo(defKey).length;

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
   * Derive a best-effort DocId from a file URI by stripping the `.md` extension
   * and any leading path components that are not part of the vault-relative
   * identifier.
   *
   * In production this is resolved against VaultIndex; here we use the filename
   * stem as a reasonable approximation that matches how RefGraph builds keys.
   */
  private uriToDocId(uri: string): string {
    try {
      const pathname = new URL(uri).pathname;
      const decoded = decodeURIComponent(pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const normalized = decoded.replace(/\\/g, '/');
      return normalized.endsWith('.md') ? normalized.slice(0, -3) : normalized;
    } catch {
      return uri;
    }
  }
}
