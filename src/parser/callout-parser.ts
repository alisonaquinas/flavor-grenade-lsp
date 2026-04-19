import type { CalloutEntry } from './types.js';
import { rangeFromOffsets } from './offset-utils.js';

/**
 * Detects Obsidian callout headers inside blockquotes.
 *
 * A callout line looks like: `> [!TYPE]` or `>> [!TYPE]+` or `> [!TYPE]- Title`.
 * Nested blockquotes may use either `>>` (no space) or `> >` (space between).
 * The depth is the number of `>` characters on the line.
 */
export class CalloutParser {
  /**
   * Find all callout headers in `text`.
   *
   * @param text - Full document text.
   */
  static parse(text: string): CalloutEntry[] {
    const entries: CalloutEntry[] = [];
    // Match lines that are callout headers.
    // Handles both `>>` and `> >` style nested blockquotes.
    // Group 1: leading > chars with optional spaces (depth = count of '>' in group 1)
    // Group 2: callout type
    // Group 3: optional fold indicator (+ or -)
    // Group 4: optional title text (trimmed)
    const pattern = /^((?:>\s*)+)\s*\[!([^\]]+)\]([+-])?([ \t]+(.+?))?[ \t]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const depth = (match[1].match(/>/g) ?? []).length;
      const type = match[2];
      const foldable = match[3] as '+' | '-' | undefined;
      const title = match[5]?.trim() || undefined;

      entries.push({
        type,
        ...(foldable !== undefined && { foldable }),
        ...(title !== undefined && { title }),
        depth,
        range: rangeFromOffsets(text, match.index, match.index + match[0].length),
      });
    }

    return entries;
  }
}
