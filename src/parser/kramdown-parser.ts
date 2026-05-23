import type {
  KramdownAttributeEntry,
  KramdownDefinitionListEntry,
  KramdownFootnoteEntry,
  KramdownMalformedAttributeEntry,
  KramdownMathBlockEntry,
  KramdownTableEntry,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

export interface KramdownParseResult {
  attributes: KramdownAttributeEntry[];
  malformedAttributes: KramdownMalformedAttributeEntry[];
  definitionLists: KramdownDefinitionListEntry[];
  tables: KramdownTableEntry[];
  footnotes: KramdownFootnoteEntry[];
  mathBlocks: KramdownMathBlockEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

interface AttributeSet {
  id?: string;
  classes: string[];
  keyValues: Record<string, string>;
  markerStart: number;
  markerEnd: number;
}

interface AttributeScanResult {
  attributes: KramdownAttributeEntry[];
  malformedAttributes: KramdownMalformedAttributeEntry[];
}

/** Parses source-local kramdown syntax without invoking renderers or Ruby code. */
export class KramdownParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): KramdownParseResult {
    const lines = KramdownParser.indexLines(text);
    const attributes = KramdownParser.parseAttributes(text, lines, opaqueRegions);
    return {
      attributes: attributes.attributes,
      malformedAttributes: attributes.malformedAttributes,
      definitionLists: KramdownParser.parseDefinitionLists(text, lines, opaqueRegions),
      tables: KramdownParser.parseTables(text, lines, opaqueRegions),
      footnotes: KramdownParser.parseFootnotes(text, lines, opaqueRegions),
      mathBlocks: KramdownParser.parseMathBlocks(text, lines),
    };
  }

  private static parseAttributes(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): AttributeScanResult {
    const attributes: KramdownAttributeEntry[] = [];
    const malformedAttributes: KramdownMalformedAttributeEntry[] = [];
    const pattern = /\{:?[^{}\n]*\}/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (KramdownParser.shouldSkip(match.index, opaqueRegions)) continue;
      const parsed = KramdownParser.parseAttributeSet(match[0]);
      if (parsed === null) continue;
      attributes.push(KramdownParser.attributeEntry(text, match, parsed));
    }
    for (const line of lines) {
      if (KramdownParser.isOpaqueLine(line, opaqueRegions)) continue;
      const start = KramdownParser.malformedAttributeStart(line.content);
      if (start === null) continue;
      malformedAttributes.push({
        raw: line.content.slice(start),
        range: rangeFromOffsets(text, line.start + start, line.end),
      });
    }
    return { attributes, malformedAttributes };
  }

  private static attributeEntry(
    text: string,
    match: RegExpExecArray,
    parsed: AttributeSet,
  ): KramdownAttributeEntry {
    return {
      raw: match[0],
      id: parsed.id,
      classes: parsed.classes,
      keyValues: parsed.keyValues,
      range: rangeFromOffsets(text, match.index, match.index + match[0].length),
      markerRange: rangeFromOffsets(
        text,
        match.index + parsed.markerStart,
        match.index + parsed.markerEnd,
      ),
    };
  }

  private static parseDefinitionLists(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): KramdownDefinitionListEntry[] {
    const lists: KramdownDefinitionListEntry[] = [];
    for (let index = 1; index < lines.length; index++) {
      const term = lines[index - 1];
      const definition = lines[index];
      if (term.content.trim() === '' || KramdownParser.isOpaqueLine(term, opaqueRegions)) continue;
      if (KramdownParser.isOpaqueLine(definition, opaqueRegions)) continue;
      if (!/^[ \t]{0,3}:[ \t]+.+$/.test(definition.content)) continue;
      const endLine = KramdownParser.definitionListEnd(lines, index);
      const last = lines[endLine - 1];
      lists.push({
        raw: text.slice(term.start, last.end),
        term: term.content.trim(),
        definitionCount: endLine - index,
        range: rangeFromOffsets(text, term.start, last.end),
      });
      index = endLine - 1;
    }
    return lists;
  }

  private static parseTables(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): KramdownTableEntry[] {
    const tables: KramdownTableEntry[] = [];
    for (let index = 0; index < lines.length - 1; index++) {
      const header = lines[index];
      if (KramdownParser.isOpaqueLine(header, opaqueRegions)) continue;
      if (!KramdownParser.isTableDelimiter(lines[index + 1].content)) continue;
      const headerCells = KramdownParser.splitTableRow(header.content);
      if (headerCells.length === 0) continue;
      const endLine = KramdownParser.tableEnd(lines, index);
      const end = lines[endLine];
      tables.push({
        raw: text.slice(header.start, end.end),
        headerCells,
        rowCount: Math.max(0, endLine - index - 1),
        range: rangeFromOffsets(text, header.start, end.end),
      });
      index = endLine;
    }
    return tables;
  }

  private static parseFootnotes(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): KramdownFootnoteEntry[] {
    const footnotes: KramdownFootnoteEntry[] = [];
    for (const line of lines) {
      if (KramdownParser.isOpaqueLine(line, opaqueRegions)) continue;
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

  private static parseMathBlocks(
    text: string,
    lines: readonly LineEntry[],
  ): KramdownMathBlockEntry[] {
    const blocks: KramdownMathBlockEntry[] = [];
    for (let index = 0; index < lines.length; index++) {
      if (!/^[ \t]*\$\$[ \t]*$/.test(lines[index].content)) continue;
      const start = lines[index];
      let endLine = index;
      for (let cursor = index + 1; cursor < lines.length; cursor++) {
        if (/^[ \t]*\$\$[ \t]*$/.test(lines[cursor].content)) {
          endLine = cursor;
          break;
        }
      }
      const end = lines[endLine];
      blocks.push({
        raw: text.slice(start.start, end.end),
        range: rangeFromOffsets(text, start.start, end.end),
      });
      index = endLine;
    }
    return blocks;
  }

  private static parseAttributeSet(raw: string): AttributeSet | null {
    const bodyStart = raw.startsWith('{:') ? 2 : 1;
    const inner = raw.slice(bodyStart, -1).trim();
    if (inner.length === 0) return null;
    const result: AttributeSet = {
      classes: [],
      keyValues: {},
      markerStart: bodyStart,
      markerEnd: bodyStart,
    };
    for (const token of inner.split(/\s+/)) {
      const tokenStart = raw.indexOf(token, bodyStart);
      if (token.startsWith('#') && token.length > 1) {
        result.id = token.slice(1);
        if (result.markerEnd === bodyStart)
          Object.assign(result, { markerStart: tokenStart, markerEnd: tokenStart + token.length });
      } else if (token.startsWith('.') && token.length > 1) {
        result.classes.push(token.slice(1));
        if (result.markerEnd === bodyStart)
          Object.assign(result, { markerStart: tokenStart, markerEnd: tokenStart + token.length });
      } else if (/^[A-Za-z_:][A-Za-z0-9_:.-]*=/.test(token)) {
        const [key, value = ''] = token.split(/=(.*)/s);
        result.keyValues[key] = value.replace(/^["']|["']$/g, '');
        if (result.markerEnd === bodyStart)
          Object.assign(result, { markerStart: tokenStart, markerEnd: tokenStart + key.length });
      } else {
        return null;
      }
    }
    return result.markerEnd === bodyStart ? null : result;
  }

  private static malformedAttributeStart(line: string): number | null {
    const candidates = [line.indexOf('{:'), line.indexOf('{#'), line.indexOf('{.')].filter(
      (index) => index >= 0,
    );
    if (candidates.length === 0) return null;
    const start = Math.min(...candidates);
    return line.slice(start).includes('}') ? null : start;
  }

  private static definitionListEnd(lines: readonly LineEntry[], startLine: number): number {
    let endLine = startLine;
    while (endLine < lines.length && /^[ \t]{0,3}:[ \t]+.+$/.test(lines[endLine].content))
      endLine++;
    return endLine;
  }

  private static tableEnd(lines: readonly LineEntry[], startLine: number): number {
    let endLine = startLine + 1;
    while (endLine + 1 < lines.length && lines[endLine + 1].content.includes('|')) endLine++;
    return endLine;
  }

  private static splitTableRow(line: string): string[] {
    return line
      .replace(/^\s*\|?|\|?\s*$/g, '')
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);
  }

  private static isTableDelimiter(line: string): boolean {
    return line.includes('|') && /^[ \t]*\|?[ \t:=-]+(?:\|[ \t:=-]+)+\|?[ \t]*$/.test(line);
  }

  private static isOpaqueLine(line: LineEntry, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return KramdownParser.shouldSkip(line.start, opaqueRegions);
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
