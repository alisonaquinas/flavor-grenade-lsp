import { Injectable } from '@nestjs/common';
import type { OFMDoc, OFMIndex, HeadingEntry } from './types.js';
import { FrontmatterParser } from './frontmatter-parser.js';
import { mark } from './opaque-region-marker.js';
import { WikiLinkParser } from './wiki-link-parser.js';
import { EmbedParser } from './embed-parser.js';
import { BlockAnchorParser } from './block-anchor-parser.js';
import { TagParser } from './tag-parser.js';
import { CalloutParser } from './callout-parser.js';
import { rangeFromOffsets } from './offset-utils.js';

/**
 * Orchestrates the 8-stage OFM parsing pipeline and produces an {@link OFMDoc}.
 *
 * `OFMParser` itself is a NestJS `@Injectable()` service. Its sub-parsers are
 * either stateless class instances (`FrontmatterParser`) or static methods
 * (`WikiLinkParser.parse`, etc.) — none require injection.
 */
@Injectable()
export class OFMParser {
  private readonly frontmatterParser = new FrontmatterParser();

  /**
   * Parse an OFM document and return a fully indexed {@link OFMDoc}.
   *
   * @param uri     - Document URI.
   * @param text    - Full document text.
   * @param version - Incremental version counter from the LSP client.
   */
  parse(uri: string, text: string, version: number): OFMDoc {
    // Stage 1: frontmatter
    const {
      frontmatter,
      bodyOffset,
      parseError: frontmatterParseError,
    } = this.frontmatterParser.parse(text);

    // Stage 2: opaque regions
    const opaqueRegions = mark(text, bodyOffset);

    // Stage 3–7: token parsers
    const index: OFMIndex = {
      wikiLinks: WikiLinkParser.parse(text, opaqueRegions),
      embeds: EmbedParser.parse(text, opaqueRegions),
      blockAnchors: BlockAnchorParser.parse(text, opaqueRegions),
      tags: TagParser.parse(text, opaqueRegions),
      callouts: CalloutParser.parse(text),
      headings: OFMParser.scanHeadings(text, opaqueRegions),
    };

    return {
      uri,
      version,
      text,
      frontmatter,
      ...(frontmatterParseError && { frontmatterParseError: true }),
      frontmatterEndOffset: bodyOffset,
      opaqueRegions,
      index,
    };
  }

  /** Stage 8: scan ATX headings (`#` to `######`). */
  private static scanHeadings(
    text: string,
    opaqueRegions: ReturnType<typeof mark>,
  ): HeadingEntry[] {
    const entries: HeadingEntry[] = [];
    const pattern = /^(#{1,6})[ \t]+(.+?)[ \t]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (opaqueRegions.some((r) => match!.index >= r.start && match!.index < r.end)) continue;

      entries.push({
        level: match[1].length,
        text: match[2],
        range: rangeFromOffsets(text, match.index, match.index + match[0].length),
      });
    }

    return entries;
  }
}
