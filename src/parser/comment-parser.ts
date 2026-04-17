import type { OpaqueRegion } from './types.js';

/**
 * Detects Obsidian `%%comment%%` spans and returns them as opaque regions.
 *
 * Comments may span multiple lines. Offsets are absolute within the full
 * document (i.e. `bodyOffset` is added automatically).
 */
export class CommentParser {
  /**
   * Find all `%%...%%` comment spans in `text`.
   *
   * @param text       - Full document text (including frontmatter prefix).
   * @param bodyOffset - Character offset where the document body begins.
   */
  static parse(text: string, bodyOffset: number): OpaqueRegion[] {
    const regions: OpaqueRegion[] = [];
    const body = text.slice(bodyOffset);
    let pos = 0;

    while (pos < body.length) {
      const open = body.indexOf('%%', pos);
      if (open === -1) break;

      const close = body.indexOf('%%', open + 2);
      if (close === -1) break;

      regions.push({
        kind: 'comment',
        start: bodyOffset + open,
        end: bodyOffset + close + 2,
      });
      pos = close + 2;
    }

    return regions;
  }
}
