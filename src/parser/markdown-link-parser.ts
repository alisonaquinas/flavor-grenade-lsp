import type {
  LinkLabelDef,
  LinkLabelRef,
  MarkdownImageRef,
  MarkdownLinkRef,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed standard Markdown link syntax grouped by entry type. */
export interface MarkdownLinkParseResult {
  markdownLinks: MarkdownLinkRef[];
  markdownImages: MarkdownImageRef[];
  linkLabelRefs: LinkLabelRef[];
  linkLabelDefs: LinkLabelDef[];
}

interface ParsedTarget {
  target: string;
  targetStart: number;
  targetEnd: number;
  title?: string;
  titleStart?: number;
  titleEnd?: number;
}

/** Parses standard Markdown links and reference definitions. */
export class MarkdownLinkParser {
  /**
   * Parse standard Markdown link syntax from document text.
   *
   * @param text          - Full document text.
   * @param opaqueRegions - Sorted list of opaque regions to skip.
   */
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): MarkdownLinkParseResult {
    const result: MarkdownLinkParseResult = {
      markdownLinks: [],
      markdownImages: [],
      linkLabelRefs: [],
      linkLabelDefs: [],
    };

    const occupiedRanges: Array<{ start: number; end: number }> = [];
    MarkdownLinkParser.parseDefinitions(text, opaqueRegions, result, occupiedRanges);
    MarkdownLinkParser.parseInlineLinks(text, opaqueRegions, result, occupiedRanges);
    MarkdownLinkParser.parseLabelRefs(text, opaqueRegions, result, occupiedRanges);

    return result;
  }

  private static parseDefinitions(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
    result: MarkdownLinkParseResult,
    occupiedRanges: Array<{ start: number; end: number }>,
  ): void {
    const pattern =
      /^\[([^\]\n]+)\]:[ \t]*(\S+)(?:[ \t]+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?[ \t]*$/gm;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (MarkdownLinkParser.shouldSkip(start, opaqueRegions, occupiedRanges)) continue;

      const label = match[1];
      const target = match[2];
      const labelStart = start + 1;
      const targetStart = start + match[0].indexOf(target);
      const targetEnd = targetStart + target.length;
      const title = match[3] ?? match[4] ?? match[5];
      const titleOffsets =
        title !== undefined
          ? MarkdownLinkParser.findTitleOffsets(text, start, end, title)
          : undefined;

      result.linkLabelDefs.push({
        raw: match[0],
        label,
        normalizedLabel: MarkdownLinkParser.normalizeLabel(label),
        target,
        ...(title !== undefined && { title }),
        range: rangeFromOffsets(text, start, end),
        labelRange: rangeFromOffsets(text, labelStart, labelStart + label.length),
        targetRange: rangeFromOffsets(text, targetStart, targetEnd),
        ...(titleOffsets !== undefined && {
          titleRange: rangeFromOffsets(text, titleOffsets.start, titleOffsets.end),
        }),
      });
      occupiedRanges.push({ start, end });
    }
  }

  private static parseInlineLinks(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
    result: MarkdownLinkParseResult,
    occupiedRanges: Array<{ start: number; end: number }>,
  ): void {
    const pattern = /(!?)\[([^\]\n]*)\]\(([^)\n]*)\)/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (MarkdownLinkParser.shouldSkip(start, opaqueRegions, occupiedRanges)) continue;
      if (MarkdownLinkParser.isWikiOrEmbedContext(text, start, end)) continue;

      const isImage = match[1] === '!';
      const textValue = match[2];
      const inner = match[3].trim();
      const parenStart = text.indexOf('(', start + match[1].length + 1 + textValue.length);
      const innerStart = parenStart + 1 + match[3].search(/\S|$/);
      const parsed = MarkdownLinkParser.parseTarget(inner, innerStart);
      if (parsed === null) continue;

      const bracketTextStart = start + match[1].length + 1;
      const common = {
        raw: match[0],
        target: parsed.target,
        ...(parsed.title !== undefined && { title: parsed.title }),
        range: rangeFromOffsets(text, start, end),
        targetRange: rangeFromOffsets(text, parsed.targetStart, parsed.targetEnd),
        ...(parsed.title !== undefined &&
          parsed.titleStart !== undefined &&
          parsed.titleEnd !== undefined && {
            titleRange: rangeFromOffsets(text, parsed.titleStart, parsed.titleEnd),
          }),
      };

      if (isImage) {
        result.markdownImages.push({
          ...common,
          alt: textValue,
          altRange: rangeFromOffsets(text, bracketTextStart, bracketTextStart + textValue.length),
        });
      } else {
        result.markdownLinks.push({
          ...common,
          text: textValue,
          textRange: rangeFromOffsets(text, bracketTextStart, bracketTextStart + textValue.length),
        });
      }
      occupiedRanges.push({ start, end });
    }
  }

  private static parseLabelRefs(
    text: string,
    opaqueRegions: readonly OpaqueRegion[],
    result: MarkdownLinkParseResult,
    occupiedRanges: Array<{ start: number; end: number }>,
  ): void {
    const pattern = /\[([^\]\n]+)\](?:\[([^\]\n]*)\])?/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (MarkdownLinkParser.shouldSkip(start, opaqueRegions, occupiedRanges)) continue;
      if (MarkdownLinkParser.isWikiOrEmbedContext(text, start, end)) continue;
      if (text[end] === '(') continue;
      if (text[end] === ':') continue;

      const displayText = match[1];
      const explicitLabel = match[2];
      const form: LinkLabelRef['form'] =
        explicitLabel === undefined ? 'shortcut' : explicitLabel === '' ? 'collapsed' : 'full';
      const label =
        explicitLabel === undefined || explicitLabel === '' ? displayText : explicitLabel;
      const textStart = start + 1;
      const labelStart =
        explicitLabel === undefined ? textStart : start + match[0].lastIndexOf('[') + 1;

      result.linkLabelRefs.push({
        raw: match[0],
        text: displayText,
        label,
        normalizedLabel: MarkdownLinkParser.normalizeLabel(label),
        form,
        range: rangeFromOffsets(text, start, end),
        textRange: rangeFromOffsets(text, textStart, textStart + displayText.length),
        labelRange: rangeFromOffsets(text, labelStart, labelStart + label.length),
      });
      occupiedRanges.push({ start, end });
    }
  }

  private static parseTarget(inner: string, innerStart: number): ParsedTarget | null {
    if (inner.length === 0) return null;

    const match = /^(\S+)(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?$/.exec(inner);
    if (match === null) return null;

    const target = match[1];
    const title = match[2] ?? match[3] ?? match[4];
    const targetStart = innerStart;
    const targetEnd = targetStart + target.length;

    if (title === undefined) {
      return { target, targetStart, targetEnd };
    }

    const titleOffset = inner.indexOf(title, target.length);
    return {
      target,
      targetStart,
      targetEnd,
      title,
      titleStart: innerStart + titleOffset,
      titleEnd: innerStart + titleOffset + title.length,
    };
  }

  private static findTitleOffsets(
    text: string,
    start: number,
    end: number,
    title: string,
  ): { start: number; end: number } | undefined {
    const offset = text.indexOf(title, start);
    if (offset < start || offset > end) return undefined;
    return { start: offset, end: offset + title.length };
  }

  private static shouldSkip(
    start: number,
    opaqueRegions: readonly OpaqueRegion[],
    occupiedRanges: Array<{ start: number; end: number }>,
  ): boolean {
    return (
      isInsideOpaqueRegion(start, opaqueRegions as OpaqueRegion[]) ||
      occupiedRanges.some((range) => start >= range.start && start < range.end)
    );
  }

  private static isWikiOrEmbedContext(text: string, start: number, end: number): boolean {
    return (
      text.slice(start, start + 2) === '[[' ||
      text.slice(start, start + 3) === '!]]' ||
      text.slice(start, start + 3) === '![[' ||
      text.slice(end, end + 1) === ']'
    );
  }

  private static normalizeLabel(label: string): string {
    return label.trim().replace(/\s+/g, ' ').toLowerCase();
  }
}
