import type {
  OpaqueRegion,
  PandocAttributeEntry,
  PandocAttributeSet,
  PandocCitationEntry,
  PandocDefinitionListEntry,
  PandocFencedDivEntry,
  PandocFootnoteEntry,
  PandocMalformedAttributeEntry,
  PandocTitleBlockEntry,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed Pandoc Markdown extension entries grouped by syntax surface. */
export interface PandocParseResult {
  titleBlocks: PandocTitleBlockEntry[];
  citations: PandocCitationEntry[];
  footnotes: PandocFootnoteEntry[];
  attributes: PandocAttributeEntry[];
  malformedAttributes: PandocMalformedAttributeEntry[];
  fencedDivs: PandocFencedDivEntry[];
  definitionLists: PandocDefinitionListEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

interface AttributeScanResult {
  attributes: PandocAttributeEntry[];
  malformedAttributes: PandocMalformedAttributeEntry[];
}

/** Parses local, source-backed Pandoc Markdown extension syntax. */
export class PandocParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): PandocParseResult {
    const lines = PandocParser.indexLines(text);
    const attributes = PandocParser.parseAttributes(text, opaqueRegions);
    return {
      titleBlocks: PandocParser.parseTitleBlocks(text, lines, opaqueRegions),
      citations: PandocParser.parseCitations(text, opaqueRegions),
      footnotes: PandocParser.parseFootnotes(text, lines, opaqueRegions),
      attributes: attributes.attributes,
      malformedAttributes: attributes.malformedAttributes,
      fencedDivs: PandocParser.parseFencedDivs(text, lines, opaqueRegions),
      definitionLists: PandocParser.parseDefinitionLists(text, lines, opaqueRegions),
    };
  }

  private static parseTitleBlocks(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): PandocTitleBlockEntry[] {
    const titleLines: LineEntry[] = [];
    for (const line of lines) {
      if (line.content.trim() === '') break;
      if (PandocParser.isOpaqueLine(line, opaqueRegions)) break;
      if (!/^%($|[ \t])/.test(line.content)) break;
      titleLines.push(line);
    }
    if (titleLines.length === 0) return [];
    const first = titleLines[0];
    const last = titleLines[titleLines.length - 1];
    return [
      {
        raw: text.slice(first.start, last.end),
        lines: titleLines.length,
        range: rangeFromOffsets(text, first.start, last.end),
      },
    ];
  }

  private static parseCitations(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): PandocCitationEntry[] {
    const citations: PandocCitationEntry[] = [];
    const pattern = /(?<![A-Za-z0-9_])(-?@)([A-Za-z0-9][A-Za-z0-9_:.-]*)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (PandocParser.shouldSkip(match.index, opaqueRegions)) continue;
      const keyStart = match.index + match[1].length;
      const end = keyStart + match[2].length;
      citations.push({
        raw: match[0],
        key: match[2],
        range: rangeFromOffsets(text, match.index, end),
        keyRange: rangeFromOffsets(text, keyStart, end),
      });
    }
    return citations;
  }

  private static parseFootnotes(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): PandocFootnoteEntry[] {
    const footnotes: PandocFootnoteEntry[] = [];
    for (const line of lines) {
      if (PandocParser.isOpaqueLine(line, opaqueRegions)) continue;
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

  private static parseAttributes(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): AttributeScanResult {
    const attributes: PandocAttributeEntry[] = [];
    const malformedAttributes: PandocMalformedAttributeEntry[] = [];
    const pattern = /\{[^{}\n]*\}/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (PandocParser.shouldSkip(match.index, opaqueRegions)) continue;
      const parsed = PandocParser.parseAttributeSet(match[0]);
      const entryRange = rangeFromOffsets(text, match.index, match.index + match[0].length);
      if (parsed === null) {
        malformedAttributes.push({ raw: match[0], range: entryRange });
      } else {
        attributes.push({ raw: match[0], ...parsed, range: entryRange });
      }
    }
    return { attributes, malformedAttributes };
  }

  private static parseFencedDivs(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): PandocFencedDivEntry[] {
    const divs: PandocFencedDivEntry[] = [];
    for (let index = 0; index < lines.length; index++) {
      const opening = lines[index];
      if (PandocParser.isOpaqueLine(opening, opaqueRegions)) continue;
      const match = /^:{3,}[ \t]*(\{[^{}\n]*\})?[ \t]*$/.exec(opening.content);
      if (match === null) continue;
      const attributes = match[1] ? PandocParser.parseAttributeSet(match[1]) : undefined;
      let endLine = index;
      for (let cursor = index + 1; cursor < lines.length; cursor++) {
        if (/^:{3,}[ \t]*$/.test(lines[cursor].content)) {
          endLine = cursor;
          break;
        }
      }
      divs.push({
        raw: text.slice(opening.start, lines[endLine].end),
        attributes: attributes ?? { classes: [], keyValues: {} },
        range: rangeFromOffsets(text, opening.start, lines[endLine].end),
        markerRange: rangeFromOffsets(text, opening.start, opening.start + 3),
      });
      index = endLine;
    }
    return divs;
  }

  private static parseDefinitionLists(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): PandocDefinitionListEntry[] {
    const lists: PandocDefinitionListEntry[] = [];
    for (let index = 1; index < lines.length; index++) {
      const term = lines[index - 1];
      const definition = lines[index];
      if (term.content.trim() === '' || PandocParser.isOpaqueLine(term, opaqueRegions)) continue;
      if (PandocParser.isOpaqueLine(definition, opaqueRegions)) continue;
      if (!/^[ \t]{0,3}:[ \t]+.+$/.test(definition.content)) continue;
      let endLine = index;
      let definitionCount = 0;
      while (endLine < lines.length && /^[ \t]{0,3}:[ \t]+.+$/.test(lines[endLine].content)) {
        definitionCount++;
        endLine++;
      }
      const last = lines[endLine - 1];
      lists.push({
        raw: text.slice(term.start, last.end),
        term: term.content.trim(),
        definitionCount,
        range: rangeFromOffsets(text, term.start, last.end),
      });
      index = endLine - 1;
    }
    return lists;
  }

  private static parseAttributeSet(raw: string): PandocAttributeSet | null {
    const inner = raw.slice(1, -1).trim();
    if (inner.length === 0) return null;
    const result: PandocAttributeSet = { classes: [], keyValues: {} };
    for (const part of inner.split(/\s+/)) {
      if (part.startsWith('#')) {
        const id = part.slice(1);
        if (id.length === 0) return null;
        result.id = id;
      } else if (part.startsWith('.')) {
        const className = part.slice(1);
        if (className.length === 0) return null;
        result.classes.push(className);
      } else if (/^[A-Za-z_:][A-Za-z0-9_:.-]*=/.test(part)) {
        const [key, value = ''] = part.split(/=(.*)/s);
        result.keyValues[key] = value.replace(/^["']|["']$/g, '');
      } else {
        return null;
      }
    }
    return result.id === undefined &&
      result.classes.length === 0 &&
      Object.keys(result.keyValues).length === 0
      ? null
      : result;
  }

  private static isOpaqueLine(line: LineEntry, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return PandocParser.shouldSkip(line.start, opaqueRegions);
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
