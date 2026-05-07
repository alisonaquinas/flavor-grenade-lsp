import type { Position, Range } from 'vscode-languageserver-types';

let cachedText: string | undefined;
let cachedLineStartOffsets: number[] | undefined;

export function buildLineStartOffsets(text: string): number[] {
  const offsets = [0];
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '\n') {
      offsets.push(index + 1);
    }
  }
  return offsets;
}

/**
 * Converts an absolute character offset within `text` to an LSP `Position`
 * (0-indexed line and character).
 *
 * @param text   - The full document text.
 * @param offset - Character offset to convert.
 */
export function offsetToPosition(
  text: string,
  offset: number,
  lineStartOffsets = getLineStartOffsets(text),
): Position {
  const boundedOffset = Math.max(0, Math.min(offset, text.length));
  let lo = 0;
  let hi = lineStartOffsets.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (lineStartOffsets[mid] <= boundedOffset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return { line: lo, character: boundedOffset - lineStartOffsets[lo] };
}

/**
 * Builds an LSP `Range` from two absolute character offsets.
 *
 * @param text  - The full document text.
 * @param start - Start offset (inclusive).
 * @param end   - End offset (exclusive).
 */
export function rangeFromOffsets(text: string, start: number, end: number): Range {
  const lineStartOffsets = getLineStartOffsets(text);
  return {
    start: offsetToPosition(text, start, lineStartOffsets),
    end: offsetToPosition(text, end, lineStartOffsets),
  };
}

function getLineStartOffsets(text: string): number[] {
  if (cachedText !== text) {
    cachedText = text;
    cachedLineStartOffsets = buildLineStartOffsets(text);
  }
  return cachedLineStartOffsets!;
}
