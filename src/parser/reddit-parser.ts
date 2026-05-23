import type {
  MarkdownLinkRef,
  OpaqueRegion,
  RedditHostReferenceEntry,
  RedditOldRedditIncompatibleListEntry,
  RedditSpoilerEntry,
  RedditSuperscriptEntry,
  RedditUnsafeLinkEntry,
} from './types.js';
import { GfmParser } from './gfm-parser.js';
import { MarkdownLinkParser } from './markdown-link-parser.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed Reddit Markdown source-local syntax. */
export interface RedditParseResult {
  spoilers: RedditSpoilerEntry[];
  superscripts: RedditSuperscriptEntry[];
  strikethroughs: ReturnType<typeof GfmParser.parse>['strikethroughs'];
  tables: ReturnType<typeof GfmParser.parse>['tables'];
  hostReferences: RedditHostReferenceEntry[];
  oldRedditIncompatibleLists: RedditOldRedditIncompatibleListEntry[];
  unsafeLinks: RedditUnsafeLinkEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

/** Parses local Reddit Markdown syntax without calling Reddit services. */
export class RedditParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): RedditParseResult {
    const gfm = GfmParser.parse(text, opaqueRegions);
    return {
      spoilers: RedditParser.parseSpoilers(text, opaqueRegions),
      superscripts: RedditParser.parseSuperscripts(text, opaqueRegions),
      strikethroughs: gfm.strikethroughs.filter((entry) => entry.raw.startsWith('~~')),
      tables: gfm.tables,
      hostReferences: RedditParser.parseHostReferences(text, opaqueRegions),
      oldRedditIncompatibleLists: RedditParser.parseOldRedditLists(text, opaqueRegions),
      unsafeLinks: RedditParser.parseUnsafeLinks(text, opaqueRegions),
    };
  }

  private static parseSpoilers(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): RedditSpoilerEntry[] {
    const entries: RedditSpoilerEntry[] = [];
    const pattern = />!([^\n]*?)!</g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      if (RedditParser.shouldSkip(start, opaqueRegions)) continue;
      const end = start + match[0].length;
      const textStart = start + 2;
      entries.push({
        raw: match[0],
        text: match[1],
        range: rangeFromOffsets(text, start, end),
        textRange: rangeFromOffsets(text, textStart, textStart + match[1].length),
      });
    }
    return entries;
  }

  private static parseSuperscripts(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): RedditSuperscriptEntry[] {
    const entries: RedditSuperscriptEntry[] = [];
    const pattern = /\^(\(([^)\n]+)\)|([A-Za-z0-9][^\s.,!?;:)\\\]]*))/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      if (RedditParser.shouldSkip(start, opaqueRegions)) continue;
      const value = match[2] ?? match[3];
      const textStart = match[2] === undefined ? start + 1 : start + 2;
      entries.push({
        raw: match[0],
        text: value,
        range: rangeFromOffsets(text, start, start + match[0].length),
        textRange: rangeFromOffsets(text, textStart, textStart + value.length),
      });
    }
    return entries;
  }

  private static parseHostReferences(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): RedditHostReferenceEntry[] {
    const entries: RedditHostReferenceEntry[] = [];
    const pattern = /\b([ru])\/([A-Za-z0-9][A-Za-z0-9_-]{1,20})\b/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      if (RedditParser.shouldSkip(start, opaqueRegions)) continue;
      const targetStart = start + 2;
      entries.push({
        raw: match[0],
        kind: match[1] === 'r' ? 'subreddit' : 'user',
        target: match[2],
        range: rangeFromOffsets(text, start, start + match[0].length),
        targetRange: rangeFromOffsets(text, targetStart, targetStart + match[2].length),
      });
    }
    return entries;
  }

  private static parseOldRedditLists(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): RedditOldRedditIncompatibleListEntry[] {
    const entries: RedditOldRedditIncompatibleListEntry[] = [];
    for (const line of RedditParser.indexLines(text)) {
      if (RedditParser.shouldSkip(line.start, opaqueRegions)) continue;
      if (!/^[ \t]*\d+\)[ \t]+/.test(line.content)) continue;
      entries.push({
        raw: line.content,
        range: rangeFromOffsets(text, line.start, line.end),
      });
    }
    return entries;
  }

  private static parseUnsafeLinks(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
  ): RedditUnsafeLinkEntry[] {
    const links = MarkdownLinkParser.parse(text, opaqueRegions).markdownLinks;
    return links
      .filter((link) => RedditParser.hasUnsafeScheme(link))
      .map((link) => ({
        raw: link.raw,
        target: link.target,
        range: link.range,
        targetRange: link.targetRange,
      }));
  }

  private static hasUnsafeScheme(link: MarkdownLinkRef): boolean {
    const schemeMatch = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(link.target);
    if (schemeMatch === null) return false;
    return !['http', 'https', 'mailto'].includes(schemeMatch[1].toLowerCase());
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
