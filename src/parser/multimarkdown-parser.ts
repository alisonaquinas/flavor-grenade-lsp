import type {
  MultimarkdownAbbreviationEntry,
  MultimarkdownCitationEntry,
  MultimarkdownCrossReferenceEntry,
  MultimarkdownFootnoteEntry,
  MultimarkdownLabelEntry,
  MultimarkdownMalformedMetadataEntry,
  MultimarkdownMetadataEntry,
  MultimarkdownTableEntry,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed MultiMarkdown extension entries grouped by syntax surface. */
export interface MultimarkdownParseResult {
  metadata: MultimarkdownMetadataEntry[];
  malformedMetadata: MultimarkdownMalformedMetadataEntry[];
  tables: MultimarkdownTableEntry[];
  footnotes: MultimarkdownFootnoteEntry[];
  citations: MultimarkdownCitationEntry[];
  crossReferences: MultimarkdownCrossReferenceEntry[];
  labels: MultimarkdownLabelEntry[];
  abbreviations: MultimarkdownAbbreviationEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

interface MetadataScanResult {
  metadata: MultimarkdownMetadataEntry[];
  malformedMetadata: MultimarkdownMalformedMetadataEntry[];
}

/** Parses source-local MultiMarkdown document-production syntax. */
export class MultimarkdownParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): MultimarkdownParseResult {
    const lines = MultimarkdownParser.indexLines(text);
    const metadata = MultimarkdownParser.parseMetadata(text, lines, opaqueRegions);
    const citations = MultimarkdownParser.parseCitations(text, lines, opaqueRegions);
    return {
      metadata: metadata.metadata,
      malformedMetadata: metadata.malformedMetadata,
      tables: MultimarkdownParser.parseTables(text, lines, opaqueRegions),
      footnotes: MultimarkdownParser.parseFootnotes(text, lines, opaqueRegions),
      citations,
      crossReferences: MultimarkdownParser.parseCrossReferences(text, opaqueRegions, citations),
      labels: MultimarkdownParser.parseLabels(text, lines, opaqueRegions),
      abbreviations: MultimarkdownParser.parseAbbreviations(text, lines, opaqueRegions),
    };
  }

  private static parseMetadata(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MetadataScanResult {
    const metadata: MultimarkdownMetadataEntry[] = [];
    const malformedMetadata: MultimarkdownMalformedMetadataEntry[] = [];
    for (const line of lines) {
      if (line.content.trim() === '') break;
      if (MultimarkdownParser.isOpaqueLine(line, opaqueRegions)) break;
      const match = /^([A-Za-z][A-Za-z0-9 _-]*):[ \t]*(.*)$/.exec(line.content);
      if (match === null) {
        if (/^[A-Za-z][A-Za-z0-9 _-]*$/.test(line.content.trim())) {
          malformedMetadata.push({
            raw: line.content,
            range: rangeFromOffsets(text, line.start, line.end),
          });
        }
        break;
      }
      metadata.push({
        raw: line.content,
        key: match[1],
        value: match[2],
        range: rangeFromOffsets(text, line.start, line.end),
        keyRange: rangeFromOffsets(text, line.start, line.start + match[1].length),
      });
    }
    return { metadata, malformedMetadata };
  }

  private static parseTables(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MultimarkdownTableEntry[] {
    const tables: MultimarkdownTableEntry[] = [];
    for (let index = 0; index < lines.length - 1; index++) {
      const header = lines[index];
      const delimiter = lines[index + 1];
      if (
        MultimarkdownParser.isOpaqueLine(header, opaqueRegions) ||
        !MultimarkdownParser.isTableDelimiter(delimiter.content)
      )
        continue;
      const headerCells = MultimarkdownParser.splitTableRow(header.content);
      if (headerCells.length === 0) continue;
      let endLine = index + 1;
      while (endLine + 1 < lines.length && lines[endLine + 1].content.includes('|')) endLine++;
      const caption = lines[endLine + 1];
      const captionMatch = caption ? /^\[.+\]\[([A-Za-z0-9_:.-]+)\]$/.exec(caption.content) : null;
      if (captionMatch !== null) endLine++;
      const end = lines[endLine];
      tables.push({
        raw: text.slice(header.start, end.end),
        headerCells,
        rowCount: Math.max(0, endLine - index - (captionMatch === null ? 1 : 2)),
        label: captionMatch?.[1],
        range: rangeFromOffsets(text, header.start, end.end),
        ...(captionMatch && {
          labelRange: rangeFromOffsets(
            text,
            lines[endLine].end - captionMatch[1].length - 1,
            lines[endLine].end - 1,
          ),
        }),
      });
      index = endLine;
    }
    return tables;
  }

  private static parseFootnotes(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MultimarkdownFootnoteEntry[] {
    const footnotes: MultimarkdownFootnoteEntry[] = [];
    for (const line of lines) {
      if (MultimarkdownParser.isOpaqueLine(line, opaqueRegions)) continue;
      const match = /^\[\^([^\]\n]+)\]:[ \t]*(.*)$/.exec(line.content);
      if (match === null) continue;
      const labelStart = line.start + 2;
      footnotes.push({
        raw: line.content,
        label: match[1],
        range: rangeFromOffsets(text, line.start, line.end),
        labelRange: rangeFromOffsets(text, labelStart, labelStart + match[1].length),
      });
    }
    return footnotes;
  }

  private static parseCitations(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MultimarkdownCitationEntry[] {
    const citations: MultimarkdownCitationEntry[] = [];
    for (const line of lines) {
      if (MultimarkdownParser.isOpaqueLine(line, opaqueRegions)) continue;
      const match = /^\[#([A-Za-z0-9_:.-]+)\]:[ \t]*(.*)$/.exec(line.content);
      if (match === null) continue;
      const keyStart = line.start + 2;
      citations.push({
        raw: line.content,
        key: match[1],
        range: rangeFromOffsets(text, line.start, line.end),
        keyRange: rangeFromOffsets(text, keyStart, keyStart + match[1].length),
      });
    }
    return citations;
  }

  private static parseCrossReferences(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
    citations: readonly MultimarkdownCitationEntry[],
  ): MultimarkdownCrossReferenceEntry[] {
    const citationKeys = new Set(citations.map((entry) => entry.key));
    const refs: MultimarkdownCrossReferenceEntry[] = [];
    const pattern = /\[([^\]\n]*)\]\[\]|\[\]\(#([A-Za-z0-9_:.-]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (MultimarkdownParser.shouldSkip(match.index, opaqueRegions)) continue;
      const target = match[2] ?? match[1];
      if (target.length === 0 || citationKeys.has(target)) continue;
      const targetStart = match[2] ? match.index + 4 : match.index + 1;
      refs.push({
        raw: match[0],
        target,
        range: rangeFromOffsets(text, match.index, match.index + match[0].length),
        targetRange: rangeFromOffsets(text, targetStart, targetStart + target.length),
      });
    }
    return refs;
  }

  private static parseLabels(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MultimarkdownLabelEntry[] {
    const labels: MultimarkdownLabelEntry[] = [];
    const pattern = /(?<!\*)\[([A-Za-z][A-Za-z0-9_:.-]+)\](?!\[|:)/g;
    for (const line of lines) {
      if (MultimarkdownParser.isOpaqueLine(line, opaqueRegions)) continue;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line.content)) !== null) {
        const before = line.content[match.index - 1];
        const after = line.content[match.index + match[0].length];
        if (before === '#' || before === '[' || after === ']') continue;
        const start = line.start + match.index;
        labels.push({
          raw: match[0],
          label: match[1],
          range: rangeFromOffsets(text, start, start + match[0].length),
          labelRange: rangeFromOffsets(text, start + 1, start + 1 + match[1].length),
        });
      }
    }
    return labels;
  }

  private static parseAbbreviations(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MultimarkdownAbbreviationEntry[] {
    const abbreviations: MultimarkdownAbbreviationEntry[] = [];
    for (const line of lines) {
      if (MultimarkdownParser.isOpaqueLine(line, opaqueRegions)) continue;
      const match = /^\*\[([^\]\n]+)\]:[ \t]*(.*)$/.exec(line.content);
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

  private static splitTableRow(line: string): string[] {
    return line
      .replace(/^\s*\|?|\|?\s*$/g, '')
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
  }

  private static isTableDelimiter(line: string): boolean {
    return line.includes('|') && /^[ \t]*\|?[ \t:=-]+(?:\|[ \t:=-]+)+\|?[ \t]*$/.test(line);
  }

  private static isOpaqueLine(line: LineEntry, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return MultimarkdownParser.shouldSkip(line.start, opaqueRegions);
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
