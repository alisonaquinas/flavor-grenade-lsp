import type {
  RMarkdownChunkEntry,
  RMarkdownInlineExpressionEntry,
  RMarkdownMalformedChunkEntry,
  RMarkdownMetadataEntry,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';

export interface RMarkdownParseResult {
  metadata: RMarkdownMetadataEntry[];
  chunks: RMarkdownChunkEntry[];
  inlineExpressions: RMarkdownInlineExpressionEntry[];
  malformedChunks: RMarkdownMalformedChunkEntry[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

/** Parses source-local R Markdown syntax without executing code. */
export class RMarkdownParser {
  static parse(text: string): RMarkdownParseResult {
    const lines = RMarkdownParser.indexLines(text);
    return {
      metadata: RMarkdownParser.parseMetadata(text, lines),
      chunks: RMarkdownParser.parseChunks(text, lines),
      inlineExpressions: RMarkdownParser.parseInlineExpressions(text),
      malformedChunks: RMarkdownParser.parseMalformedChunks(text, lines),
    };
  }

  private static parseMetadata(
    text: string,
    lines: readonly LineEntry[],
  ): RMarkdownMetadataEntry[] {
    if (lines[0]?.content.trim() !== '---') return [];
    const endIndex = lines.findIndex((line, index) => index > 0 && line.content.trim() === '---');
    if (endIndex < 0) return [];
    const metadata: RMarkdownMetadataEntry[] = [];
    for (const line of lines.slice(1, endIndex)) {
      const match = /^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/.exec(line.content);
      if (match === null) continue;
      metadata.push({
        raw: line.content,
        key: match[1],
        value: match[2]?.trim(),
        range: rangeFromOffsets(text, line.start, line.end),
        keyRange: rangeFromOffsets(text, line.start, line.start + match[1].length),
      });
    }
    return metadata;
  }

  private static parseChunks(text: string, lines: readonly LineEntry[]): RMarkdownChunkEntry[] {
    const chunks: RMarkdownChunkEntry[] = [];
    for (let index = 0; index < lines.length; index++) {
      const match = /^[ \t]{0,3}(```+|~~~+)\{([^}\n]+)\}[ \t]*$/.exec(lines[index].content);
      if (match === null) continue;
      const header = RMarkdownParser.parseChunkHeader(match[2]);
      const endLine = RMarkdownParser.findFenceEnd(lines, index + 1, match[1][0]);
      const end = lines[endLine];
      const headerStart = lines[index].start + match[1].length + 1;
      chunks.push({
        raw: text.slice(lines[index].start, end.end),
        engine: header.engine,
        ...(header.label !== undefined && { label: header.label }),
        options: header.options,
        range: rangeFromOffsets(text, lines[index].start, end.end),
        headerRange: rangeFromOffsets(text, headerStart, headerStart + match[2].length),
        engineRange: rangeFromOffsets(text, headerStart, headerStart + header.engine.length),
        ...(header.labelRange !== undefined && {
          labelRange: RMarkdownParser.relativeRange(text, headerStart, header.labelRange),
        }),
        optionRanges: header.optionRanges.map((range) =>
          RMarkdownParser.relativeRange(text, headerStart, range),
        ),
      });
      index = endLine;
    }
    return chunks;
  }

  private static parseMalformedChunks(
    text: string,
    lines: readonly LineEntry[],
  ): RMarkdownMalformedChunkEntry[] {
    const malformed: RMarkdownMalformedChunkEntry[] = [];
    for (const line of lines) {
      if (/^[ \t]{0,3}(```+|~~~+)\{[^}\n]*$/.test(line.content)) {
        malformed.push({
          raw: line.content,
          range: rangeFromOffsets(text, line.start, line.end),
        });
      }
    }
    return malformed;
  }

  private static parseInlineExpressions(text: string): RMarkdownInlineExpressionEntry[] {
    const expressions: RMarkdownInlineExpressionEntry[] = [];
    const pattern = /`r[ \t]+([^`]+)`/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const expressionStart = match.index + 3;
      expressions.push({
        raw: match[0],
        expression: match[1].trim(),
        range: rangeFromOffsets(text, match.index, match.index + match[0].length),
        expressionRange: rangeFromOffsets(text, expressionStart, expressionStart + match[1].length),
      });
    }
    return expressions;
  }

  private static parseChunkHeader(header: string): {
    engine: string;
    label?: string;
    options: Record<string, string>;
    labelRange?: { start: number; end: number };
    optionRanges: Array<{ start: number; end: number }>;
  } {
    const parts = RMarkdownParser.splitHeaderParts(header);
    const [engine, label] = parts[0].text.trim().split(/\s+/, 2);
    const options: Record<string, string> = {};
    const optionRanges: Array<{ start: number; end: number }> = [];
    for (const part of parts.slice(1)) {
      const option = /^([A-Za-z][A-Za-z0-9_.-]*)\s*=\s*(.+)$/.exec(part.text.trim());
      if (option === null) continue;
      options[option[1]] = option[2].trim();
      optionRanges.push({ start: part.start, end: part.end });
    }
    return {
      engine,
      ...(label !== undefined && { label }),
      options,
      ...(label !== undefined && {
        labelRange: {
          start: parts[0].text.indexOf(label),
          end: parts[0].text.indexOf(label) + label.length,
        },
      }),
      optionRanges,
    };
  }

  private static splitHeaderParts(
    header: string,
  ): Array<{ text: string; start: number; end: number }> {
    const parts: Array<{ text: string; start: number; end: number }> = [];
    let start = 0;
    for (let index = 0; index <= header.length; index++) {
      if (index !== header.length && header[index] !== ',') continue;
      const text = header.slice(start, index);
      parts.push({ text, start, end: index });
      start = index + 1;
    }
    return parts;
  }

  private static relativeRange(
    text: string,
    base: number,
    range: { start: number; end: number },
  ): ReturnType<typeof rangeFromOffsets> {
    return rangeFromOffsets(text, base + range.start, base + range.end);
  }

  private static findFenceEnd(
    lines: readonly LineEntry[],
    startLine: number,
    marker: string,
  ): number {
    for (let index = startLine; index < lines.length; index++) {
      if (RMarkdownParser.isClosingFence(lines[index].content, marker)) {
        return index;
      }
    }
    return Math.max(startLine - 1, 0);
  }

  private static isClosingFence(line: string, marker: string): boolean {
    if (marker === '`') {
      return /^[ \t]{0,3}`{3,}[ \t]*$/.test(line);
    }

    return /^[ \t]{0,3}~{3,}[ \t]*$/.test(line);
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
