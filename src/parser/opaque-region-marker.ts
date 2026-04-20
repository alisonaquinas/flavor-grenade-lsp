import type { OpaqueRegion } from './types.js';
import { CommentParser } from './comment-parser.js';
import { MathParser } from './math-parser.js';
import { CodeParser } from './code-parser.js';

/**
 * Runs all three opaque-region parsers (comment, math, code) and merges the
 * results into a sorted, non-overlapping list.
 *
 * @param text       - Full document text.
 * @param bodyOffset - Offset of the document body (after frontmatter).
 */
export function mark(text: string, bodyOffset: number): OpaqueRegion[] {
  const raw = [
    ...CommentParser.parse(text, bodyOffset),
    ...MathParser.parse(text, bodyOffset),
    ...CodeParser.parse(text, bodyOffset),
  ];

  return mergeRegions(raw);
}

/**
 * Returns `true` when `offset` falls inside any of `regions`.
 *
 * Start is inclusive; end is exclusive.
 *
 * @param offset  - Absolute character offset to test.
 * @param regions - Sorted or unsorted list of regions.
 */
export function isInsideOpaqueRegion(offset: number, regions: OpaqueRegion[]): boolean {
  return regions.some((r) => offset >= r.start && offset < r.end);
}

/** Sort regions by start and drop any that are fully contained in a prior one. */
function mergeRegions(regions: OpaqueRegion[]): OpaqueRegion[] {
  if (regions.length === 0) return [];

  const sorted = [...regions].sort((a, b) => a.start - b.start);
  const merged: OpaqueRegion[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start < prev.end) {
      // Overlapping or contained — extend if needed
      if (cur.end > prev.end) {
        merged[merged.length - 1] = { kind: prev.kind, start: prev.start, end: cur.end };
      }
    } else {
      merged.push(cur);
    }
  }

  return merged;
}
