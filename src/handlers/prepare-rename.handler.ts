import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Position, Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import { entityAtPosition } from './cursor-entity.js';
import type { OpaqueRegion } from '../parser/types.js';

/**
 * Successful prepare-rename result: the range to highlight (the entity being
 * renamed) and the current text as a placeholder.
 */
export interface PrepareRenameResult {
  range: Range;
  placeholder: string;
}

/**
 * Error result returned when a rename is not allowed at the cursor position.
 */
export interface PrepareRenameError {
  error: {
    code: number;
    message: string;
  };
}

/**
 * Convert an LSP `Position` to an absolute character offset within `text`.
 *
 * Implementation: sum the byte lengths of lines 0..position.line (each plus
 * one for the `\n` terminator), then add `position.character`.
 */
function positionToOffset(text: string, position: Position): number {
  const lines = text.split('\n');
  let offset = 0;
  for (let i = 0; i < position.line && i < lines.length; i++) {
    offset += lines[i].length + 1; // +1 for \n
  }
  offset += position.character;
  return offset;
}

/**
 * Return `true` when `offset` falls within any of the given opaque regions.
 */
function isInOpaqueRegion(offset: number, regions: OpaqueRegion[]): boolean {
  for (const region of regions) {
    if (offset >= region.start && offset < region.end) {
      return true;
    }
  }
  return false;
}

/**
 * Compute the LSP range covering only the heading text, excluding the `#`
 * prefix characters and the single space separator.
 *
 * For a level-2 heading `## My Text` the full range starts at character 0;
 * the text range starts at character `level + 1` (the `## ` prefix).
 */
function headingTextRange(heading: { level: number; range: Range }): Range {
  const prefixLen = heading.level + 1; // level `#` chars + 1 space
  return {
    start: {
      line: heading.range.start.line,
      character: heading.range.start.character + prefixLen,
    },
    end: heading.range.end,
  };
}

/**
 * Handles `textDocument/prepareRename` requests.
 *
 * Returns:
 * - `{ range, placeholder }` when the cursor is on a heading or wiki-link.
 * - `{ error: { code: -32602, message: '…' } }` when the cursor is inside an
 *   opaque region (code, math, comment).
 * - `null` when no renameable entity is found at the cursor.
 */
@Injectable()
export class PrepareRenameHandler {
  constructor(private readonly parseCache: ParseCache) {}

  /**
   * Handle a `textDocument/prepareRename` request.
   *
   * @param params - LSP prepareRename parameters.
   * @returns Rename target info, error, or null.
   */
  handle(params: {
    textDocument: { uri: string };
    position: Position;
  }): PrepareRenameResult | PrepareRenameError | null {
    const { uri } = params.textDocument;
    const { position } = params;

    const doc = this.parseCache.get(uri);
    if (doc === undefined) return null;

    // Opaque-region check: compare the cursor offset against parser-emitted regions.
    // `OFMDoc` does not carry raw text, so the accurate offset requires the raw
    // source string. `textStore` is populated by `setDocumentText()`, which
    // `LspModule` calls on every `textDocument/didOpen` and `textDocument/didChange`.
    // When the text is available, `positionToOffset` gives an exact result.
    // When it is not (e.g. first request before any open/change event), we fall
    // back to `position.line + position.character` — one byte per line for `\n`
    // — which is approximate but acceptable as a degraded safety net.
    const rawText = this.textStore.get(uri);
    const offset =
      rawText !== undefined
        ? positionToOffset(rawText, position)
        : position.line + position.character; // line * 1 (for \n) + char — approximate

    if (isInOpaqueRegion(offset, doc.opaqueRegions)) {
      return {
        error: {
          code: -32602,
          message: 'Cannot rename at this location',
        },
      };
    }

    const entity = entityAtPosition(doc, position);

    switch (entity.kind) {
      case 'heading': {
        const range = headingTextRange(entity.entry);
        return { range, placeholder: entity.entry.text };
      }

      case 'wiki-link': {
        return { range: entity.entry.range, placeholder: entity.entry.target };
      }

      default:
        return null;
    }
  }

  /** Companion raw-text store for accurate offset computation. */
  private readonly textStore = new Map<string, string>();

  /**
   * Store the raw source text for a document.
   *
   * Should be called whenever a document is opened or changed so that opaque-
   * region offset checks are accurate.
   *
   * @param uri  - Document URI.
   * @param text - Raw document text.
   */
  setDocumentText(uri: string, text: string): void {
    this.textStore.set(uri, text);
  }

  /**
   * Remove the stored raw text for a document.
   *
   * @param uri - Document URI.
   */
  removeDocumentText(uri: string): void {
    this.textStore.delete(uri);
  }
}
