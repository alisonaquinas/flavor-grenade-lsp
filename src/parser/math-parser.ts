import type { OpaqueRegion } from './types.js';

/**
 * Detects LaTeX math spans (`$...$` and `$$...$$`) and returns them as opaque
 * regions.
 *
 * Rules:
 * - Display math `$$\n...\n$$` is matched first (multi-line allowed).
 * - Inline math `$...$` must not span a newline.
 */
export class MathParser {
  /**
   * Find all math regions in `text`.
   *
   * @param text       - Full document text (including frontmatter prefix).
   * @param bodyOffset - Character offset where the document body begins.
   */
  static parse(text: string, bodyOffset: number): OpaqueRegion[] {
    const regions: OpaqueRegion[] = [];
    const body = text.slice(bodyOffset);

    // Pass 1: display math $$...$$
    const displayRegions = MathParser.parseDisplay(body, bodyOffset);
    regions.push(...displayRegions);

    // Pass 2: inline math $...$ (skip positions already in display regions)
    const inlineRegions = MathParser.parseInline(body, bodyOffset, displayRegions);
    regions.push(...inlineRegions);

    return regions;
  }

  private static parseDisplay(body: string, bodyOffset: number): OpaqueRegion[] {
    const regions: OpaqueRegion[] = [];
    let pos = 0;
    while (pos < body.length) {
      const open = body.indexOf('$$', pos);
      if (open === -1) break;
      const close = body.indexOf('$$', open + 2);
      if (close === -1) break;
      regions.push({ kind: 'math', start: bodyOffset + open, end: bodyOffset + close + 2 });
      pos = close + 2;
    }
    return regions;
  }

  private static parseInline(
    body: string,
    bodyOffset: number,
    exclude: OpaqueRegion[],
  ): OpaqueRegion[] {
    const regions: OpaqueRegion[] = [];
    let pos = 0;

    while (pos < body.length) {
      const dollar = body.indexOf('$', pos);
      if (dollar === -1) break;

      const absPos = bodyOffset + dollar;

      // Skip if already inside a display region
      if (MathParser.isExcluded(absPos, exclude)) {
        pos = dollar + 1;
        continue;
      }

      // Find closing $, no newlines allowed
      let end = -1;
      for (let i = dollar + 1; i < body.length; i++) {
        if (body[i] === '\n') break;
        if (body[i] === '$') {
          end = i;
          break;
        }
      }

      if (end === -1) {
        pos = dollar + 1;
        continue;
      }

      const absEnd = bodyOffset + end + 1;
      if (!MathParser.isExcluded(bodyOffset + end, exclude)) {
        regions.push({ kind: 'math', start: absPos, end: absEnd });
        pos = end + 1;
      } else {
        pos = dollar + 1;
      }
    }

    return regions;
  }

  private static isExcluded(offset: number, regions: OpaqueRegion[]): boolean {
    return regions.some((r) => offset >= r.start && offset < r.end);
  }
}
