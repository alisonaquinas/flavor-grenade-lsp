import { Injectable } from '@nestjs/common';
import type { Position, Range, SelectionRange } from 'vscode-languageserver-types';
import { rangeFromOffsets } from '../parser/offset-utils.js';
import { ParseCache } from '../parser/parser.module.js';
import type { OFMDoc, OpaqueRegion } from '../parser/types.js';
import { ErrorCodes, JsonRpcError } from '../transport/json-rpc-dispatcher.js';

interface SelectionRangeParams {
  textDocument?: { uri?: string };
  positions?: Position[];
}

/** Handles `textDocument/selectionRange` requests. */
@Injectable()
export class SelectionRangeHandler {
  constructor(private readonly parseCache: ParseCache) {}

  handle(params: SelectionRangeParams): SelectionRange[] {
    const uri = params.textDocument?.uri;
    if (typeof uri !== 'string' || params.positions === undefined) return [];

    const doc = this.parseCache.get(uri);
    if (doc === undefined) return [];
    if (params.positions.some((position) => !isValidPosition(position, doc.text))) {
      throw new JsonRpcError(ErrorCodes.InvalidParams, 'Invalid selectionRange position');
    }

    return params.positions.map((position) => this.selectionRangeForPosition(doc, position));
  }

  private selectionRangeForPosition(doc: OFMDoc, position: Position): SelectionRange {
    const opaqueRange = this.opaqueRangeAt(doc, position);
    if (opaqueRange !== undefined) return buildChain([opaqueRange]);

    const ranges = [
      this.tokenRangeAt(doc, position),
      paragraphRangeAt(doc.text, position),
      sectionRangeAt(doc, position),
      documentRange(doc.text),
    ].filter((range): range is Range => range !== undefined);

    return buildChain(dedupeNestedRanges(ranges));
  }

  private tokenRangeAt(doc: OFMDoc, position: Position): Range | undefined {
    return doc.index.wikiLinks.find((entry) => containsPosition(entry.range, position))?.range;
  }

  private opaqueRangeAt(doc: OFMDoc, position: Position): Range | undefined {
    const offset = offsetAtPosition(doc.text, position);
    const region = doc.opaqueRegions.find((candidate) => isInsideRegion(offset, candidate));
    return region === undefined ? undefined : rangeFromOffsets(doc.text, region.start, region.end);
  }
}

function buildChain(ranges: Range[]): SelectionRange {
  const [range, ...rest] = ranges;
  const parent = rest.length > 0 ? buildChain(rest) : undefined;
  return parent === undefined ? { range } : { range, parent };
}

function dedupeNestedRanges(ranges: Range[]): Range[] {
  const deduped: Range[] = [];
  for (const range of ranges) {
    if (!deduped.some((existing) => sameRange(existing, range))) {
      deduped.push(range);
    }
  }
  return deduped;
}

function paragraphRangeAt(text: string, position: Position): Range {
  const lines = textLines(text);
  let startLine = position.line;
  let endLine = position.line;

  while (
    startLine > 0 &&
    lines[startLine - 1].trim().length > 0 &&
    !isHeadingLine(lines[startLine - 1])
  ) {
    startLine--;
  }
  while (
    endLine + 1 < lines.length &&
    lines[endLine + 1].trim().length > 0 &&
    !isHeadingLine(lines[endLine + 1])
  ) {
    endLine++;
  }

  return {
    start: { line: startLine, character: 0 },
    end: { line: endLine, character: lines[endLine].length },
  };
}

function sectionRangeAt(doc: OFMDoc, position: Position): Range | undefined {
  const headings = [...doc.index.headings].sort(
    (left, right) => left.range.start.line - right.range.start.line,
  );
  const headingIndex = headings.findLastIndex(
    (heading) => heading.range.start.line <= position.line,
  );
  if (headingIndex < 0) return undefined;

  const heading = headings[headingIndex];
  const nextHeading = headings[headingIndex + 1];
  const lines = textLines(doc.text);
  const endLine = nextHeading === undefined ? lines.length - 1 : nextHeading.range.start.line - 1;

  return {
    start: { line: heading.range.start.line, character: 0 },
    end: { line: endLine, character: lines[endLine].length },
  };
}

function documentRange(text: string): Range {
  const lines = textLines(text);
  const lastLine = lines.length - 1;
  return {
    start: { line: 0, character: 0 },
    end: { line: lastLine, character: lines[lastLine].length },
  };
}

function isValidPosition(position: Position, text: string): boolean {
  if (!Number.isInteger(position.line) || !Number.isInteger(position.character)) return false;
  const lines = textLines(text);
  return (
    position.line >= 0 &&
    position.line < lines.length &&
    position.character >= 0 &&
    position.character <= lines[position.line].length
  );
}

function containsPosition(range: Range, position: Position): boolean {
  return comparePositions(range.start, position) <= 0 && comparePositions(position, range.end) < 0;
}

function isInsideRegion(offset: number, region: OpaqueRegion): boolean {
  return offset >= region.start && offset < region.end;
}

function offsetAtPosition(text: string, position: Position): number {
  let offset = 0;
  for (let line = 0; line < position.line; line++) {
    const newline = text.indexOf('\n', offset);
    if (newline === -1) return text.length;
    offset = newline + 1;
  }
  return offset + position.character;
}

function sameRange(left: Range, right: Range): boolean {
  return (
    comparePositions(left.start, right.start) === 0 && comparePositions(left.end, right.end) === 0
  );
}

function comparePositions(left: Position, right: Position): number {
  return left.line - right.line || left.character - right.character;
}

function textLines(text: string): string[] {
  return text.split(/\r?\n/);
}

function isHeadingLine(line: string): boolean {
  return /^#{1,6}\s/.test(line);
}
