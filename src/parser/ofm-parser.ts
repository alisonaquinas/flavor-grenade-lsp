import { Injectable } from '@nestjs/common';
import type { OFMDoc, OFMIndex, HeadingEntry, ParseContext } from './types.js';
import { FrontmatterParser } from './frontmatter-parser.js';
import { mark } from './opaque-region-marker.js';
import { WikiLinkParser } from './wiki-link-parser.js';
import { EmbedParser } from './embed-parser.js';
import { BlockAnchorParser } from './block-anchor-parser.js';
import { TagParser } from './tag-parser.js';
import { CalloutParser } from './callout-parser.js';
import { MarkdownLinkParser } from './markdown-link-parser.js';
import { GfmParser } from './gfm-parser.js';
import { GlfmParser } from './glfm-parser.js';
import { PandocParser } from './pandoc-parser.js';
import { rangeFromOffsets } from './offset-utils.js';

const MAX_PARSE_CHARACTERS = 1024 * 1024;

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
  parse(uri: string, text: string, version: number, context?: ParseContext): OFMDoc {
    const parseContext = context ?? { effectiveFlavor: 'obsidian' as const };
    if (text.length > MAX_PARSE_CHARACTERS) {
      return {
        uri,
        version,
        text,
        frontmatter: null,
        frontmatterEndOffset: 0,
        opaqueRegions: [],
        index: OFMParser.emptyIndex(),
        markdownFlavor: parseContext.effectiveFlavor,
        parseContext,
      };
    }

    // Stage 1: frontmatter
    const {
      frontmatter,
      bodyOffset,
      parseError: frontmatterParseError,
    } = this.frontmatterParser.parse(text);

    // Stage 2: opaque regions
    const opaqueRegions = mark(text, bodyOffset);

    // Stage 3–7: token parsers
    const markdownLinks = MarkdownLinkParser.parse(text, opaqueRegions);
    const enableObsidianSyntax = parseContext.effectiveFlavor === 'obsidian';
    const enableGfmSyntax =
      parseContext.effectiveFlavor === 'gfm' || parseContext.effectiveFlavor === 'glfm';
    const enableGlfmSyntax = parseContext.effectiveFlavor === 'glfm';
    const enablePandocSyntax = parseContext.effectiveFlavor === 'pandoc';
    const gfm = enableGfmSyntax ? GfmParser.parse(text, opaqueRegions) : undefined;
    const glfm = enableGlfmSyntax ? GlfmParser.parse(text, opaqueRegions) : undefined;
    const pandoc = enablePandocSyntax ? PandocParser.parse(text, opaqueRegions) : undefined;
    const gfmAutolinks = gfm?.autolinks.map((entry) => GfmParser.toMarkdownLink(entry)) ?? [];
    const index: OFMIndex = {
      wikiLinks: enableObsidianSyntax ? WikiLinkParser.parse(text, opaqueRegions) : [],
      embeds: enableObsidianSyntax ? EmbedParser.parse(text, opaqueRegions) : [],
      blockAnchors: enableObsidianSyntax ? BlockAnchorParser.parse(text, opaqueRegions) : [],
      tags: enableObsidianSyntax ? TagParser.parse(text, opaqueRegions) : [],
      callouts: enableObsidianSyntax ? CalloutParser.parse(text) : [],
      headings: OFMParser.scanHeadings(text, opaqueRegions, bodyOffset),
      markdownLinks: [...markdownLinks.markdownLinks, ...gfmAutolinks],
      markdownImages: markdownLinks.markdownImages,
      linkLabelRefs: markdownLinks.linkLabelRefs,
      linkLabelDefs: markdownLinks.linkLabelDefs,
      ...(gfm !== undefined && {
        gfmTables: gfm.tables,
        gfmMalformedTables: gfm.malformedTables,
        gfmTaskListItems: gfm.taskListItems,
        gfmStrikethroughs: gfm.strikethroughs,
        gfmAutolinks: gfm.autolinks,
      }),
      ...(glfm !== undefined && {
        glfmInapplicableTaskListItems: glfm.inapplicableTaskListItems,
        glfmDescriptionLists: glfm.descriptionLists,
        glfmMalformedDescriptionLists: glfm.malformedDescriptionLists,
        glfmFootnotes: glfm.footnotes,
        glfmTocTags: glfm.tocTags,
        glfmHostReferences: glfm.hostReferences,
      }),
      ...(pandoc !== undefined && {
        pandocTitleBlocks: pandoc.titleBlocks,
        pandocCitations: pandoc.citations,
        pandocFootnotes: pandoc.footnotes,
        pandocAttributes: pandoc.attributes,
        pandocMalformedAttributes: pandoc.malformedAttributes,
        pandocFencedDivs: pandoc.fencedDivs,
        pandocDefinitionLists: pandoc.definitionLists,
      }),
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
      markdownFlavor: parseContext.effectiveFlavor,
      parseContext,
    };
  }

  private static emptyIndex(): OFMIndex {
    return {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      markdownLinks: [],
      markdownImages: [],
      linkLabelRefs: [],
      linkLabelDefs: [],
      gfmTables: [],
      gfmMalformedTables: [],
      gfmTaskListItems: [],
      gfmStrikethroughs: [],
      gfmAutolinks: [],
      glfmInapplicableTaskListItems: [],
      glfmDescriptionLists: [],
      glfmMalformedDescriptionLists: [],
      glfmFootnotes: [],
      glfmTocTags: [],
      glfmHostReferences: [],
      pandocTitleBlocks: [],
      pandocCitations: [],
      pandocFootnotes: [],
      pandocAttributes: [],
      pandocMalformedAttributes: [],
      pandocFencedDivs: [],
      pandocDefinitionLists: [],
    };
  }

  /** Stage 8: scan ATX (`#`) and setext (`===` / `---`) headings. */
  private static scanHeadings(
    text: string,
    opaqueRegions: ReturnType<typeof mark>,
    bodyOffset: number,
  ): HeadingEntry[] {
    const entries: HeadingEntry[] = [];
    const pattern = /^(#{1,6})[ \t]+(.+?)[ \t]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index < bodyOffset) continue;
      if (OFMParser.isOpaqueOffset(match.index, opaqueRegions)) continue;

      entries.push({
        level: match[1].length,
        text: match[2],
        range: rangeFromOffsets(text, match.index, match.index + match[0].length),
      });
    }

    const lines = OFMParser.indexLines(text);
    for (let i = 1; i < lines.length; i++) {
      const underline = lines[i];
      const previous = lines[i - 1];
      if (previous.start < bodyOffset || underline.start < bodyOffset) continue;
      const underlineMatch = /^[ \t]*(=+|-+)[ \t]*$/.exec(underline.content);
      if (underlineMatch === null || previous.content.trim().length === 0) continue;
      if (
        OFMParser.isOpaqueOffset(previous.start, opaqueRegions) ||
        OFMParser.isOpaqueOffset(underline.start, opaqueRegions)
      ) {
        continue;
      }

      entries.push({
        level: underlineMatch[1][0] === '=' ? 1 : 2,
        text: previous.content.trim(),
        range: rangeFromOffsets(text, previous.start, underline.end),
      });
    }

    return entries.sort((a, b) => {
      if (a.range.start.line !== b.range.start.line) return a.range.start.line - b.range.start.line;
      return a.range.start.character - b.range.start.character;
    });
  }

  private static isOpaqueOffset(offset: number, opaqueRegions: ReturnType<typeof mark>): boolean {
    return opaqueRegions.some((region) => offset >= region.start && offset < region.end);
  }

  private static indexLines(text: string): Array<{ content: string; start: number; end: number }> {
    const lines: Array<{ content: string; start: number; end: number }> = [];
    const pattern = /[^\r\n]*(?:\r\n|\n|\r|$)/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (match[0] === '') break;
      const start = match.index;
      const content = match[0].replace(/\r?\n$|\r$/, '');
      lines.push({ content, start, end: start + match[0].length });
    }

    return lines;
  }
}
