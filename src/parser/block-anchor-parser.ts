import type { OpaqueRegion, BlockAnchorEntry } from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/**
 * Detects block anchors of the form `^identifier` at the end of non-blank lines.
 *
 * Valid identifier characters: `[a-zA-Z0-9-]`.
 */
export class BlockAnchorParser {
  /**
   * Find all block anchors in `text`, skipping tokens inside `opaqueRegions`.
   *
   * @param text          - Full document text.
   * @param opaqueRegions - Sorted list of opaque regions to skip.
   */
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): BlockAnchorEntry[] {
    const entries: BlockAnchorEntry[] = [];
    // Match ^ followed by id chars at end of line (optionally preceded by whitespace)
    const pattern = /[ \t](\^[a-zA-Z0-9-]+)[ \t]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const anchorStr = match[1]; // e.g. "^my-anchor"
      const anchorStart = match.index + match[0].indexOf('^');

      if (isInsideOpaqueRegion(anchorStart, opaqueRegions as OpaqueRegion[])) continue;

      const id = anchorStr.slice(1); // strip ^
      entries.push({
        id,
        range: rangeFromOffsets(text, anchorStart, anchorStart + anchorStr.length),
      });
    }

    return entries;
  }
}
