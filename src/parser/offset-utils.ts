import type { Position, Range } from 'vscode-languageserver-types';

/**
 * Converts an absolute character offset within `text` to an LSP `Position`
 * (0-indexed line and character).
 *
 * @param text   - The full document text.
 * @param offset - Character offset to convert.
 */
export function offsetToPosition(text: string, offset: number): Position {
  let line = 0;
  let lastNl = -1;
  for (let i = 0; i < offset; i++) {
    if (text[i] === '\n') {
      line++;
      lastNl = i;
    }
  }
  return { line, character: offset - lastNl - 1 };
}

/**
 * Builds an LSP `Range` from two absolute character offsets.
 *
 * @param text  - The full document text.
 * @param start - Start offset (inclusive).
 * @param end   - End offset (exclusive).
 */
export function rangeFromOffsets(text: string, start: number, end: number): Range {
  return {
    start: offsetToPosition(text, start),
    end: offsetToPosition(text, end),
  };
}
