import type {
  GfmAutolinkEntry,
  GfmMalformedTableEntry,
  GfmStrikethroughEntry,
  GfmTableEntry,
  GfmTaskListItemEntry,
  MarkdownLinkRef,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed GFM extension entries grouped by syntax surface. */
export interface GfmParseResult {
  tables: GfmTableEntry[];
  malformedTables: GfmMalformedTableEntry[];
  taskListItems: GfmTaskListItemEntry[];
  strikethroughs: GfmStrikethroughEntry[];
  autolinks: GfmAutolinkEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

/** Parses local, source-backed GitHub Flavored Markdown extension syntax. */
export class GfmParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): GfmParseResult {
    const lines = GfmParser.indexLines(text);
    return {
      tables: GfmParser.parseTables(text, lines, opaqueRegions),
      malformedTables: GfmParser.parseMalformedTables(text, lines, opaqueRegions),
      taskListItems: GfmParser.parseTaskListItems(text, lines, opaqueRegions),
      strikethroughs: GfmParser.parseStrikethroughs(text, opaqueRegions),
      autolinks: GfmParser.parseAutolinks(text, opaqueRegions),
    };
  }

  static toMarkdownLink(entry: GfmAutolinkEntry): MarkdownLinkRef {
    return {
      raw: entry.raw,
      text: entry.raw,
      target: entry.target,
      range: entry.range,
      textRange: entry.range,
      targetRange: entry.targetRange,
    };
  }

  private static parseTables(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): GfmTableEntry[] {
    const tables: GfmTableEntry[] = [];
    for (let index = 1; index < lines.length; index++) {
      const delimiter = lines[index];
      const header = lines[index - 1];
      if (GfmParser.isOpaqueLine(delimiter, opaqueRegions)) continue;
      if (GfmParser.isOpaqueLine(header, opaqueRegions)) continue;
      if (!GfmParser.isDelimiterRow(delimiter.content)) continue;
      if (!header.content.includes('|')) continue;

      const headerCells = GfmParser.cells(header.content);
      const delimiterCells = GfmParser.cells(delimiter.content);
      if (headerCells.length !== delimiterCells.length) continue;

      let endLine = index;
      for (let cursor = index + 1; cursor < lines.length; cursor++) {
        const line = lines[cursor];
        if (line.content.trim() === '' || !line.content.includes('|')) break;
        if (GfmParser.isOpaqueLine(line, opaqueRegions)) break;
        endLine = cursor;
      }

      const end = lines[endLine].end;
      tables.push({
        raw: text.slice(header.start, end),
        headerCells,
        rowCount: Math.max(0, endLine - index),
        range: rangeFromOffsets(text, header.start, end),
      });
    }
    return tables;
  }

  private static parseMalformedTables(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): GfmMalformedTableEntry[] {
    const malformed: GfmMalformedTableEntry[] = [];
    for (let index = 1; index < lines.length; index++) {
      const delimiter = lines[index];
      const header = lines[index - 1];
      if (GfmParser.isOpaqueLine(delimiter, opaqueRegions)) continue;
      if (GfmParser.isOpaqueLine(header, opaqueRegions)) continue;
      if (!GfmParser.isDelimiterRow(delimiter.content) || !header.content.includes('|')) continue;

      const headerCells = GfmParser.cells(header.content);
      const delimiterCells = GfmParser.cells(delimiter.content);
      if (headerCells.length === delimiterCells.length) continue;

      malformed.push({
        raw: text.slice(header.start, delimiter.end),
        headerCells,
        delimiterCells,
        range: rangeFromOffsets(text, header.start, delimiter.end),
      });
    }
    return malformed;
  }

  private static parseTaskListItems(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): GfmTaskListItemEntry[] {
    const tasks: GfmTaskListItemEntry[] = [];
    for (const line of lines) {
      if (GfmParser.isOpaqueLine(line, opaqueRegions)) continue;
      const match = /^([ \t]{0,3}[-*+][ \t]+)\[([ xX])\][ \t]+(.*)$/.exec(line.content);
      if (match === null) continue;
      const markerStart = line.start + match[1].length;
      tasks.push({
        raw: line.content,
        checked: match[2].toLowerCase() === 'x',
        text: match[3].trim(),
        range: rangeFromOffsets(text, line.start, line.end),
        markerRange: rangeFromOffsets(text, markerStart, markerStart + 3),
      });
    }
    return tasks;
  }

  private static parseStrikethroughs(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): GfmStrikethroughEntry[] {
    const entries: GfmStrikethroughEntry[] = [];
    const pattern = /(~{1,2})([^~\n]+?)\1/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (GfmParser.shouldSkip(start, opaqueRegions)) continue;
      if (text[start - 1] === '~' || text[end] === '~') continue;
      const textStart = start + match[1].length;
      entries.push({
        raw: match[0],
        text: match[2],
        range: rangeFromOffsets(text, start, end),
        textRange: rangeFromOffsets(text, textStart, textStart + match[2].length),
      });
    }
    return entries;
  }

  private static parseAutolinks(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): GfmAutolinkEntry[] {
    const entries: GfmAutolinkEntry[] = [];
    const pattern =
      /\b(?:https?:\/\/[^\s<]+|www\.[^\s<]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      let raw = match[0];
      const start = match.index;
      if (GfmParser.shouldSkip(start, opaqueRegions)) continue;
      if (!GfmParser.hasAutolinkBoundary(text, start)) continue;
      raw = raw.replace(/[.,!?;:]+$/, '').replace(/\)+$/, (suffix) => {
        const open = (raw.match(/\(/g) ?? []).length;
        const close = (raw.match(/\)/g) ?? []).length;
        return close > open ? suffix.slice(0, -1) : suffix;
      });
      const end = start + raw.length;
      const target = raw.startsWith('www.') ? `http://${raw}` : raw;
      entries.push({
        raw,
        target,
        range: rangeFromOffsets(text, start, end),
        targetRange: rangeFromOffsets(text, start, end),
      });
    }
    return entries;
  }

  private static cells(line: string): string[] {
    let trimmed = line.trim();
    if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
    return trimmed.split('|').map((cell) => cell.trim());
  }

  private static isDelimiterRow(line: string): boolean {
    if (!line.includes('|')) return false;
    const cells = GfmParser.cells(line);
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  }

  private static isOpaqueLine(line: LineEntry, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return isInsideOpaqueRegion(line.start, opaqueRegions as OpaqueRegion[]);
  }

  private static shouldSkip(offset: number, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return isInsideOpaqueRegion(offset, opaqueRegions as OpaqueRegion[]);
  }

  private static hasAutolinkBoundary(text: string, start: number): boolean {
    if (start === 0) return true;
    return /[\s*_~(]/.test(text[start - 1]);
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
