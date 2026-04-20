import type { OpaqueRegion, TagEntry } from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/**
 * Detects Obsidian tags of the form `#tag` or `#parent/child`.
 *
 * A `#` is a valid tag start only when preceded by whitespace, start of line,
 * or non-alphanumeric/non-underscore punctuation.
 */
export class TagParser {
  /**
   * Find all tags in `text`, skipping tokens inside `opaqueRegions`.
   *
   * @param text          - Full document text.
   * @param opaqueRegions - Sorted list of opaque regions to skip.
   */
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): TagEntry[] {
    const entries: TagEntry[] = [];
    // Tag body: unicode letters/numbers, emoji (Emoji_Presentation), underscore, hyphen, slash.
    // \p{Emoji_Presentation} captures pictographic emoji (🚀, ❤️, etc.) without
    // accidentally matching ASCII punctuation that shares the Symbol category.
    const pattern =
      /(?<=[^\p{L}\p{N}\p{Emoji_Presentation}_]|^)#([\p{L}\p{N}\p{Emoji_Presentation}_][\p{L}\p{N}\p{Emoji_Presentation}_/-]*)/gmu;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const hashIdx = match.index;
      if (isInsideOpaqueRegion(hashIdx, opaqueRegions as OpaqueRegion[])) continue;

      const tag = match[0]; // includes the #
      entries.push({
        tag,
        range: rangeFromOffsets(text, hashIdx, hashIdx + tag.length),
      });
    }

    return entries;
  }
}
