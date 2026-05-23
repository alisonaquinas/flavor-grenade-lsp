import type {
  MdxEsmDeclarationEntry,
  MdxExpressionEntry,
  MdxJsxElementEntry,
  MdxMalformedBoundaryEntry,
  OpaqueRegion,
} from './types.js';
import { rangeFromOffsets } from './offset-utils.js';
import { isInsideOpaqueRegion } from './opaque-region-marker.js';

/** Parsed MDX syntax surfaces used by local Markdown-mode LSP features. */
export interface MdxParseResult {
  esmDeclarations: MdxEsmDeclarationEntry[];
  jsxElements: MdxJsxElementEntry[];
  expressions: MdxExpressionEntry[];
  malformedBoundaries: MdxMalformedBoundaryEntry[];
  opaqueRegions: OpaqueRegion[];
}

interface LineEntry {
  content: string;
  start: number;
  end: number;
}

/** Parses MDX islands without evaluating JavaScript, JSX, or imports. */
export class MdxParser {
  static parse(text: string, opaqueRegions: readonly OpaqueRegion[]): MdxParseResult {
    const lines = MdxParser.indexLines(text);
    const esmDeclarations = MdxParser.parseEsm(text, lines, opaqueRegions);
    const expressions = MdxParser.parseExpressions(text, lines, opaqueRegions);
    const jsxElements = MdxParser.parseJsx(text, lines, opaqueRegions);
    const malformedBoundaries = MdxParser.parseMalformed(text, lines, opaqueRegions);
    return {
      esmDeclarations,
      jsxElements,
      expressions,
      malformedBoundaries,
      opaqueRegions: [
        ...esmDeclarations.map((entry) => MdxParser.region('mdx-esm', entry.range, lines)),
        ...jsxElements.map((entry) => MdxParser.region('mdx-jsx', entry.range, lines)),
        ...expressions.map((entry) => MdxParser.region('mdx-expression', entry.range, lines)),
      ],
    };
  }

  private static parseEsm(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MdxEsmDeclarationEntry[] {
    const entries: MdxEsmDeclarationEntry[] = [];
    for (const line of lines) {
      if (MdxParser.shouldSkip(line.start, opaqueRegions)) continue;
      const match = /^\s*(import|export)\b(.*)$/.exec(line.content);
      if (match === null) continue;
      const kind = match[1] as 'import' | 'export';
      const name = MdxParser.esmName(kind, line.content);
      const nameStart = line.start + Math.max(0, line.content.indexOf(name));
      const source = /\bfrom\s+['"]([^'"]+)['"]/.exec(line.content)?.[1];
      entries.push({
        raw: line.content,
        kind,
        name,
        ...(source !== undefined && { source }),
        range: rangeFromOffsets(text, line.start, line.end),
        nameRange: rangeFromOffsets(text, nameStart, nameStart + name.length),
      });
    }
    return entries;
  }

  private static parseJsx(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MdxJsxElementEntry[] {
    const entries: MdxJsxElementEntry[] = [];
    const pattern = /<([A-Z][A-Za-z0-9_$]*(?:\.[A-Za-z_$][\w$]*)?)(?=[\s/>])/g;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      if (MdxParser.shouldSkip(line.start, opaqueRegions)) continue;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(line.content)) !== null) {
        const start = line.start + match.index;
        const end = MdxParser.jsxEndOffset(lines, lineIndex, match[1], start);
        const nameStart = start + 1;
        entries.push({
          raw: text.slice(start, end),
          name: match[1],
          range: rangeFromOffsets(text, start, end),
          nameRange: rangeFromOffsets(text, nameStart, nameStart + match[1].length),
        });
      }
    }
    return entries;
  }

  private static parseExpressions(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MdxExpressionEntry[] {
    const entries: MdxExpressionEntry[] = [];
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (
        MdxParser.shouldSkip(line.start, opaqueRegions) ||
        !line.content.trimStart().startsWith('{')
      ) {
        continue;
      }
      const start = line.start + line.content.indexOf('{');
      const end = MdxParser.expressionEndOffset(lines, index);
      entries.push({
        raw: text.slice(start, end),
        range: rangeFromOffsets(text, start, end),
      });
      index = MdxParser.lineIndexForOffset(lines, end);
    }
    return entries;
  }

  private static parseMalformed(
    text: string,
    lines: readonly LineEntry[],
    opaqueRegions: readonly OpaqueRegion[],
  ): MdxMalformedBoundaryEntry[] {
    const entries: MdxMalformedBoundaryEntry[] = [];
    for (const line of lines) {
      if (MdxParser.shouldSkip(line.start, opaqueRegions)) continue;
      const trimmed = line.content.trimStart();
      if (/^<[A-Z][A-Za-z0-9_$]*(?:\s|$)/.test(trimmed) && !trimmed.includes('>')) {
        entries.push(MdxParser.malformed(text, line, 'unclosed-jsx'));
      }
      if (trimmed.startsWith('{') && !MdxParser.expressionCloses(lines, lines.indexOf(line))) {
        entries.push(MdxParser.malformed(text, line, 'unbalanced-expression'));
      }
    }
    return entries;
  }

  private static jsxEndOffset(
    lines: readonly LineEntry[],
    startLine: number,
    name: string,
    fallbackStart: number,
  ): number {
    const first = lines[startLine];
    const suffix = first.content.slice(fallbackStart - first.start);
    if (suffix.includes('/>')) return fallbackStart + suffix.indexOf('/>') + 2;
    const sameLineClose = suffix.indexOf(`</${name}>`);
    if (sameLineClose >= 0) return fallbackStart + sameLineClose + name.length + 3;
    for (let index = startLine + 1; index < lines.length; index++) {
      const close = lines[index].content.indexOf(`</${name}>`);
      if (close >= 0) return lines[index].start + close + name.length + 3;
    }
    const localClose = suffix.indexOf('>');
    return localClose >= 0 ? fallbackStart + localClose + 1 : first.end;
  }

  private static expressionEndOffset(lines: readonly LineEntry[], startLine: number): number {
    let balance = 0;
    for (let index = startLine; index < lines.length; index++) {
      const line = lines[index];
      balance += MdxParser.braceDelta(line.content);
      if (balance <= 0 && index > startLine) return line.end;
      if (balance <= 0 && line.content.includes('}')) {
        return line.start + line.content.lastIndexOf('}') + 1;
      }
    }
    return lines[lines.length - 1]?.end ?? 0;
  }

  private static expressionCloses(lines: readonly LineEntry[], startLine: number): boolean {
    let balance = 0;
    for (let index = startLine; index < lines.length; index++) {
      balance += MdxParser.braceDelta(lines[index].content);
      if (balance <= 0 && lines[index].content.includes('}')) return true;
    }
    return false;
  }

  private static esmName(kind: 'import' | 'export', line: string): string {
    if (kind === 'import') {
      return (
        /^\s*import\s+([A-Za-z_$][\w$]*)/.exec(line)?.[1] ??
        /^\s*import\s+\{\s*([A-Za-z_$][\w$]*)/.exec(line)?.[1] ??
        'import'
      );
    }
    return (
      /^\s*export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/.exec(line)?.[1] ??
      (/^\s*export\s+default\b/.test(line) ? 'default' : 'export')
    );
  }

  private static braceDelta(text: string): number {
    let balance = 0;
    for (const char of text) {
      if (char === '{') balance++;
      if (char === '}') balance--;
    }
    return balance;
  }

  private static malformed(
    text: string,
    line: LineEntry,
    reason: string,
  ): MdxMalformedBoundaryEntry {
    return {
      raw: line.content,
      reason,
      range: rangeFromOffsets(text, line.start, line.end),
    };
  }

  private static region(
    kind: OpaqueRegion['kind'],
    range: MdxEsmDeclarationEntry['range'],
    lines: readonly LineEntry[],
  ): OpaqueRegion {
    const startLine = lines[range.start.line];
    const endLine = lines[range.end.line];
    return {
      kind,
      start: (startLine?.start ?? 0) + range.start.character,
      end: (endLine?.start ?? 0) + range.end.character,
    };
  }

  private static lineIndexForOffset(lines: readonly LineEntry[], offset: number): number {
    return Math.max(
      0,
      lines.findIndex((line) => offset >= line.start && offset <= line.end),
    );
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
