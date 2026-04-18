import 'reflect-metadata';
import { Injectable } from '@nestjs/common';

/**
 * Discriminated union describing the completion context detected at the cursor.
 */
export type CompletionContext =
  | { kind: 'wiki-link'; partial: string }
  | { kind: 'wiki-link-heading'; targetStem: string; headingPrefix: string }
  | { kind: 'wiki-link-block'; targetStem: string; blockPrefix: string }
  | { kind: 'embed'; partial: string }
  | { kind: 'tag'; partial: string }
  | { kind: 'callout'; partial: string }
  | { kind: 'none' };

/** Maximum number of characters to look back from the cursor. */
const MAX_LOOKBACK = 100;

/**
 * Analyzes document text at a given cursor offset to determine what kind of
 * completion context applies.
 *
 * Scans backwards from the cursor (up to {@link MAX_LOOKBACK} characters) to
 * detect OFM trigger patterns and returns a typed {@link CompletionContext}.
 */
@Injectable()
export class ContextAnalyzer {
  /**
   * Analyze the text at the given offset and return the completion context.
   *
   * @param text   - The full document text (or at least the prefix up to `offset`).
   * @param offset - The cursor offset (exclusive end; characters at [0, offset)).
   */
  analyze(text: string, offset: number): CompletionContext {
    const start = Math.max(0, offset - MAX_LOOKBACK);
    // Work only with the prefix of text up to the cursor position.
    const prefix = text.slice(start, offset);

    return this.detectContext(prefix);
  }

  private detectContext(prefix: string): CompletionContext {
    // Order matters: check most-specific patterns first.

    // 1. Callout: ends with '> [!' optionally followed by non-bracket chars
    const calloutMatch = />\s\[!([A-Z]*)$/i.exec(prefix);
    if (calloutMatch !== null) {
      return { kind: 'callout', partial: calloutMatch[1].toUpperCase() };
    }

    // 2. Embed: starts with '![['
    const embedMatch = /!\[\[([^\]#^|]*)$/.exec(prefix);
    if (embedMatch !== null) {
      return { kind: 'embed', partial: embedMatch[1] };
    }

    // 3. Wiki-link-block: '[[' then optional stem then '#^' then optional prefix
    //    Pattern: [[<stem>#^<blockPrefix>   -- blockPrefix may be empty
    const blockMatch = /\[\[([^\]#^|]*)#\^([^\]|]*)$/.exec(prefix);
    if (blockMatch !== null) {
      return {
        kind: 'wiki-link-block',
        targetStem: blockMatch[1],
        blockPrefix: blockMatch[2],
      };
    }

    // 4. Wiki-link-heading: '[[' then optional stem then '#' then optional prefix
    //    Pattern: [[<stem>#<headingPrefix>
    const headingMatch = /\[\[([^\]#^|]*)#([^\]^|]*)$/.exec(prefix);
    if (headingMatch !== null) {
      return {
        kind: 'wiki-link-heading',
        targetStem: headingMatch[1],
        headingPrefix: headingMatch[2],
      };
    }

    // 5. Wiki-link (plain): '[[' not preceded by '!'
    //    Pattern: [[<partial> where partial has no # ^ | ] chars
    const wikiMatch = /(?<!\!)\[\[([^\]#^|]*)$/.exec(prefix);
    if (wikiMatch !== null) {
      return { kind: 'wiki-link', partial: wikiMatch[1] };
    }

    // 6. Tag: '#' preceded by whitespace, start-of-string, or punctuation
    //    The partial is the text after '#'
    const tagMatch = /(?:^|[\s\p{P}])#([\w/-]*)$/u.exec(prefix);
    if (tagMatch !== null) {
      return { kind: 'tag', partial: tagMatch[1] };
    }

    return { kind: 'none' };
  }
}
