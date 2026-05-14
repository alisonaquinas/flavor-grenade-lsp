import type {
  OpaqueRegion,
  StackOverflowFencedCodeBlockEntry,
  StackOverflowLanguageDirectiveEntry,
  StackOverflowMalformedLanguageDirectiveEntry,
  StackOverflowSpoilerEntry,
  StackOverflowTagReferenceEntry,
} from './types.js';
import { GfmParser } from './gfm-parser.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed Stack Overflow Markdown source-local syntax. */
export interface StackOverflowParseResult {
  tagReferences: StackOverflowTagReferenceEntry[];
  spoilers: StackOverflowSpoilerEntry[];
  languageDirectives: StackOverflowLanguageDirectiveEntry[];
  fencedCodeBlocks: StackOverflowFencedCodeBlockEntry[];
  tables: ReturnType<typeof GfmParser.parse>['tables'];
  malformedLanguageDirectives: StackOverflowMalformedLanguageDirectiveEntry[];
}

/** Parses local Stack Overflow Markdown syntax without Stack Exchange lookups. */
export class StackOverflowParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): StackOverflowParseResult {
    const gfm = GfmParser.parse(text, opaqueRegions);
    const directives = StackOverflowParser.parseLanguageDirectives(text, opaqueRegions);
    return {
      tagReferences: StackOverflowParser.parseTagReferences(text, opaqueRegions),
      spoilers: StackOverflowParser.parseSpoilers(text, opaqueRegions),
      languageDirectives: directives.valid,
      fencedCodeBlocks: StackOverflowParser.parseFencedCodeBlocks(text, opaqueRegions),
      tables: gfm.tables,
      malformedLanguageDirectives: directives.malformed,
    };
  }

  private static parseTagReferences(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): StackOverflowTagReferenceEntry[] {
    const entries: StackOverflowTagReferenceEntry[] = [];
    const pattern = /\[(tag|meta-tag):([A-Za-z0-9_.-]+)\]/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      if (StackOverflowParser.shouldSkip(start, opaqueRegions)) continue;
      const targetStart = start + match[1].length + 2;
      entries.push({
        raw: match[0],
        kind: match[1] === 'tag' ? 'tag' : 'meta-tag',
        target: match[2],
        range: rangeFromOffsets(text, start, start + match[0].length),
        targetRange: rangeFromOffsets(text, targetStart, targetStart + match[2].length),
      });
    }
    return entries;
  }

  private static parseSpoilers(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): StackOverflowSpoilerEntry[] {
    const entries: StackOverflowSpoilerEntry[] = [];
    const pattern = /^([ \t]{0,3}>![ \t]?)(.*)$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      if (StackOverflowParser.shouldSkip(start, opaqueRegions)) continue;
      const textStart = start + match[1].length;
      entries.push({
        raw: match[0],
        text: match[2],
        range: rangeFromOffsets(text, start, start + match[0].length),
        textRange: rangeFromOffsets(text, textStart, textStart + match[2].length),
      });
    }
    return entries;
  }

  private static parseLanguageDirectives(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): {
    valid: StackOverflowLanguageDirectiveEntry[];
    malformed: StackOverflowMalformedLanguageDirectiveEntry[];
  } {
    const valid: StackOverflowLanguageDirectiveEntry[] = [];
    const malformed: StackOverflowMalformedLanguageDirectiveEntry[] = [];
    const pattern = /<!--\s*(language(?:-all)?):\s*([A-Za-z0-9_-]+)\s*-->/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      if (StackOverflowParser.shouldSkip(start, opaqueRegions)) continue;
      const languageStart = start + match[0].indexOf(match[2]);
      const entry = {
        raw: match[0],
        scope: match[1] === 'language-all' ? 'all' : 'next-block',
        language: match[2],
        range: rangeFromOffsets(text, start, start + match[0].length),
        languageRange: rangeFromOffsets(text, languageStart, languageStart + match[2].length),
      } satisfies StackOverflowLanguageDirectiveEntry;
      if (entry.language.startsWith('lang-')) valid.push(entry);
      else
        malformed.push({ raw: entry.raw, range: entry.range, languageRange: entry.languageRange });
    }
    return { valid, malformed };
  }

  private static parseFencedCodeBlocks(
    text: string,
    _opaqueRegions: readonly OpaqueRegion[],
  ): StackOverflowFencedCodeBlockEntry[] {
    const entries: StackOverflowFencedCodeBlockEntry[] = [];
    const pattern = /^([ \t]{0,3}(```+|~~~+)[ \t]+)(lang-[A-Za-z0-9_-]+)[ \t]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const languageStart = start + match[1].length;
      entries.push({
        raw: match[0],
        language: match[3],
        range: rangeFromOffsets(text, start, start + match[0].length),
        languageRange: rangeFromOffsets(text, languageStart, languageStart + match[3].length),
      });
    }
    return entries;
  }

  private static shouldSkip(offset: number, opaqueRegions: readonly OpaqueRegion[]): boolean {
    return isInsideOpaqueRegion(offset, opaqueRegions as OpaqueRegion[]);
  }
}
