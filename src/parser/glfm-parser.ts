import type {
  GlfmDescriptionListEntry,
  GlfmFootnoteEntry,
  GlfmHostReferenceEntry,
  GlfmInapplicableTaskListItemEntry,
  GlfmMalformedDescriptionListEntry,
  GlfmTocTagEntry,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed GLFM extension entries grouped by syntax surface. */
export interface GlfmParseResult {
  inapplicableTaskListItems: GlfmInapplicableTaskListItemEntry[];
  descriptionLists: GlfmDescriptionListEntry[];
  malformedDescriptionLists: GlfmMalformedDescriptionListEntry[];
  footnotes: GlfmFootnoteEntry[];
  tocTags: GlfmTocTagEntry[];
  hostReferences: GlfmHostReferenceEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

interface DescriptionListResult {
  descriptionLists: GlfmDescriptionListEntry[];
  malformedDescriptionLists: GlfmMalformedDescriptionListEntry[];
}

interface DescriptionBlockResult {
  endLine: number;
  definitionCount: number;
  malformed: boolean;
}

/** Parses local, source-backed GitLab Flavored Markdown extension syntax. */
export class GlfmParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): GlfmParseResult {
    const lines = GlfmParser.indexLines(text);
    const descriptionLists = GlfmParser.parseDescriptionLists(text, lines, opaqueRegions);
    return {
      inapplicableTaskListItems: GlfmParser.parseInapplicableTaskListItems(
        text,
        lines,
        opaqueRegions,
      ),
      descriptionLists: descriptionLists.descriptionLists,
      malformedDescriptionLists: descriptionLists.malformedDescriptionLists,
      footnotes: GlfmParser.parseFootnotes(text, lines, opaqueRegions),
      tocTags: GlfmParser.parseTocTags(text, opaqueRegions),
      hostReferences: GlfmParser.parseHostReferences(text, opaqueRegions),
    };
  }

  private static parseInapplicableTaskListItems(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): GlfmInapplicableTaskListItemEntry[] {
    const tasks: GlfmInapplicableTaskListItemEntry[] = [];
    for (const line of lines) {
      if (GlfmParser.isOpaqueLine(line, opaqueRegions)) continue;
      const match = /^([ \t]{0,3}[-*+][ \t]+)\[~\][ \t]+(.*)$/.exec(line.content);
      if (match === null) continue;
      const markerStart = line.start + match[1].length;
      tasks.push({
        raw: line.content,
        text: match[2].trim(),
        range: rangeFromOffsets(text, line.start, line.end),
        markerRange: rangeFromOffsets(text, markerStart, markerStart + 3),
      });
    }
    return tasks;
  }

  private static parseDescriptionLists(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): DescriptionListResult {
    const descriptionLists: GlfmDescriptionListEntry[] = [];
    const malformedDescriptionLists: GlfmMalformedDescriptionListEntry[] = [];

    for (let index = 1; index < lines.length; index++) {
      const term = lines[index - 1];
      const firstDefinition = lines[index];
      if (term.content.trim() === '' || GlfmParser.isOpaqueLine(term, opaqueRegions)) continue;
      if (GlfmParser.isOpaqueLine(firstDefinition, opaqueRegions)) continue;
      const firstDefinitionMatch = /^[ \t]{0,3}:[ \t]*(.*)$/.exec(firstDefinition.content);
      if (firstDefinitionMatch === null) continue;

      const block = GlfmParser.collectDescriptionDefinitions(index, lines, opaqueRegions);

      const range = rangeFromOffsets(text, term.start, lines[block.endLine].end);
      if (block.malformed) {
        malformedDescriptionLists.push({
          raw: text.slice(term.start, lines[block.endLine].end),
          term: term.content.trim(),
          range,
        });
      } else {
        descriptionLists.push({
          raw: text.slice(term.start, lines[block.endLine].end),
          term: term.content.trim(),
          definitionCount: block.definitionCount,
          range,
        });
      }
      index = block.endLine;
    }

    return { descriptionLists, malformedDescriptionLists };
  }

  private static collectDescriptionDefinitions(
    startIndex: number,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): DescriptionBlockResult {
    let cursor = startIndex;
    let endLine = startIndex;
    let definitionCount = 0;
    let sawBlankDefinition = false;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (GlfmParser.isOpaqueLine(line, opaqueRegions)) break;
      const match = /^[ \t]{0,3}:[ \t]*(.*)$/.exec(line.content);
      if (match === null) break;
      if (match[1].trim() === '') {
        sawBlankDefinition = true;
      } else {
        definitionCount++;
      }
      endLine = cursor;
      cursor++;
    }
    return {
      endLine,
      definitionCount,
      malformed: sawBlankDefinition || definitionCount === 0,
    };
  }

  private static parseFootnotes(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): GlfmFootnoteEntry[] {
    const footnotes: GlfmFootnoteEntry[] = [];
    for (const line of lines) {
      if (GlfmParser.isOpaqueLine(line, opaqueRegions)) continue;
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

  private static parseTocTags(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): GlfmTocTagEntry[] {
    const entries: GlfmTocTagEntry[] = [];
    const pattern = /\[\[_TOC_]]|\[TOC]/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (GlfmParser.shouldSkip(match.index, opaqueRegions)) continue;
      entries.push({
        raw: match[0],
        range: rangeFromOffsets(text, match.index, match.index + match[0].length),
      });
    }
    return entries;
  }

  private static parseHostReferences(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): GlfmHostReferenceEntry[] {
    const entries: GlfmHostReferenceEntry[] = [];
    const occupied: Array<{ start: number; end: number }> = [];
    const crossProject = /\b[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+#\d+\b/g;
    let crossMatch: RegExpExecArray | null;

    while ((crossMatch = crossProject.exec(text)) !== null) {
      const start = crossMatch.index;
      const end = start + crossMatch[0].length;
      if (GlfmParser.shouldSkip(start, opaqueRegions)) continue;
      entries.push({
        raw: crossMatch[0],
        kind: 'cross-project',
        range: rangeFromOffsets(text, start, end),
      });
      occupied.push({ start, end });
    }

    const simple = /(?<![A-Za-z0-9._/-])(?:#\d+\b|!\d+\b|&\d+\b|@[A-Za-z0-9][A-Za-z0-9._-]*)/g;
    let simpleMatch: RegExpExecArray | null;
    while ((simpleMatch = simple.exec(text)) !== null) {
      const start = simpleMatch.index;
      const end = start + simpleMatch[0].length;
      if (GlfmParser.shouldSkip(start, opaqueRegions)) continue;
      if (occupied.some((range) => start >= range.start && end <= range.end)) continue;
      entries.push({
        raw: simpleMatch[0],
        kind: GlfmParser.hostReferenceKind(simpleMatch[0]),
        range: rangeFromOffsets(text, start, end),
      });
    }

    return entries.sort((left, right) => {
      if (left.range.start.line !== right.range.start.line) {
        return left.range.start.line - right.range.start.line;
      }
      return left.range.start.character - right.range.start.character;
    });
  }

  private static hostReferenceKind(raw: string): GlfmHostReferenceEntry['kind'] {
    if (raw.startsWith('!')) return 'merge-request';
    if (raw.startsWith('&')) return 'epic';
    if (raw.startsWith('@')) return 'user';
    return 'issue';
  }

  private static isOpaqueLine(line: LineEntry, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return GlfmParser.shouldSkip(line.start, opaqueRegions);
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
