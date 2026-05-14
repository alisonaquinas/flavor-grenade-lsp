import type {
  MarkdownExtraAbbreviationEntry,
  MarkdownExtraAttributeEntry,
  MarkdownExtraDefinitionListEntry,
  MarkdownExtraFencedCodeBlockEntry,
  MarkdownExtraFootnoteEntry,
  MarkdownExtraMalformedAttributeEntry,
  MarkdownExtraTableEntry,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { KramdownParser } from './kramdown-parser.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

export interface MarkdownExtraParseResult {
  attributes: MarkdownExtraAttributeEntry[];
  malformedAttributes: MarkdownExtraMalformedAttributeEntry[];
  definitionLists: MarkdownExtraDefinitionListEntry[];
  tables: MarkdownExtraTableEntry[];
  footnotes: MarkdownExtraFootnoteEntry[];
  abbreviations: MarkdownExtraAbbreviationEntry[];
  fencedCodeBlocks: MarkdownExtraFencedCodeBlockEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

/** Parses source-local Markdown Extra syntax without invoking renderers. */
export class MarkdownExtraParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): MarkdownExtraParseResult {
    const shared = KramdownParser.parse(text, opaqueRegions);
    const lines = MarkdownExtraParser.indexLines(text);
    return {
      attributes: shared.attributes,
      malformedAttributes: shared.malformedAttributes,
      definitionLists: shared.definitionLists,
      tables: shared.tables,
      footnotes: shared.footnotes,
      abbreviations: MarkdownExtraParser.parseAbbreviations(text, lines, opaqueRegions),
      fencedCodeBlocks: MarkdownExtraParser.parseFencedCodeBlocks(text, lines),
    };
  }

  private static parseAbbreviations(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MarkdownExtraAbbreviationEntry[] {
    const abbreviations: MarkdownExtraAbbreviationEntry[] = [];
    for (const line of lines) {
      if (MarkdownExtraParser.shouldSkip(line.start, opaqueRegions)) continue;
      const match = /^\*\[([^\]\n]+)\]:[ \t]*(.+)$/.exec(line.content);
      if (match === null) continue;
      const labelStart = line.start + 2;
      abbreviations.push({
        raw: line.content,
        label: match[1],
        value: match[2],
        range: rangeFromOffsets(text, line.start, line.end),
        labelRange: rangeFromOffsets(text, labelStart, labelStart + match[1].length),
      });
    }
    return abbreviations;
  }

  private static parseFencedCodeBlocks(
    text: string,
    lines: readonly LineEntry[],
  ): MarkdownExtraFencedCodeBlockEntry[] {
    const blocks: MarkdownExtraFencedCodeBlockEntry[] = [];
    for (let index = 0; index < lines.length; index++) {
      const match = /^[ \t]{0,3}(```+|~~~+)(?:[ \t]+(.+?))?[ \t]*$/.exec(lines[index].content);
      if (match === null) continue;
      const endLine = MarkdownExtraParser.findFenceEnd(lines, index + 1, match[1][0]);
      const end = lines[endLine];
      blocks.push({
        raw: text.slice(lines[index].start, end.end),
        language: MarkdownExtraParser.languageFromInfo(match[2]),
        range: rangeFromOffsets(text, lines[index].start, end.end),
        markerRange: rangeFromOffsets(
          text,
          lines[index].start,
          lines[index].start + match[1].length,
        ),
      });
      index = endLine;
    }
    return blocks;
  }

  private static findFenceEnd(
    lines: readonly LineEntry[],
    startLine: number,
    marker: string,
  ): number {
    for (let index = startLine; index < lines.length; index++) {
      if (new RegExp(`^[ \\t]{0,3}\\${marker}{3,}[ \\t]*$`).test(lines[index].content)) {
        return index;
      }
    }
    return Math.max(startLine - 1, 0);
  }

  private static languageFromInfo(info: string | undefined): string | undefined {
    if (info === undefined) return undefined;
    const classMatch = /\.([A-Za-z0-9_-]+)/.exec(info);
    if (classMatch !== null) return classMatch[1];
    const bare = info.trim().split(/\s+/)[0];
    return bare.length > 0 ? bare : undefined;
  }

  private static shouldSkip(offset: number, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return isInsideOpaqueRegion(offset, opaqueRegions as OpaqueRegion[]);
  }

  private static indexLines(text: string): LineEntry[] {
    const lines: LineEntry[] = [];
    const pattern = /[^\r\n]*(?:\r\n|\n|\r|$)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (match[0] === '') break;
      const start = match.index;
      const content = match[0].replace(/\r?\n$|\r$/, '');
      lines.push({ content, start, end: start + content.length });
    }
    return lines;
  }
}
