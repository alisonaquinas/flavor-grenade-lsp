import { Injectable } from '@nestjs/common';
import type { FoldingRange } from 'vscode-languageserver-types';
import { offsetToPosition, rangeFromOffsets } from '../parser/offset-utils.js';
import { ParseCache } from '../parser/parser.module.js';
import type { OFMDoc, OpaqueRegion } from '../parser/types.js';

interface FoldingRangeParams {
  textDocument?: { uri?: string };
}

/** Handles `textDocument/foldingRange` requests. */
@Injectable()
export class FoldingRangeHandler {
  constructor(private readonly parseCache: ParseCache) {}

  handle(params: FoldingRangeParams): FoldingRange[] {
    const uri = params.textDocument?.uri;
    if (typeof uri !== 'string') return [];

    const doc = this.parseCache.get(uri);
    if (doc === undefined) return [];

    const builder = new FoldingRangeBuilder(this.lineCount(doc.text));
    this.addFrontmatterFold(doc, builder);
    this.addHeadingFolds(doc, builder);
    this.addGfmTableFolds(doc, builder);
    this.addGlfmDescriptionListFolds(doc, builder);
    this.addPandocFolds(doc, builder);
    this.addMultimarkdownFolds(doc, builder);
    this.addMdxFolds(doc, builder);
    this.addKramdownFolds(doc, builder);
    this.addMarkdownExtraFolds(doc, builder);
    this.addRMarkdownFolds(doc, builder);
    this.addRedditFolds(doc, builder);
    this.addCalloutFolds(doc, builder);
    this.addOpaqueRegionFolds(doc, builder);
    return builder.build();
  }

  private addFrontmatterFold(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    if (doc.frontmatterEndOffset <= 0 || !doc.text.startsWith('---')) return;

    const bodyStart = offsetToPosition(doc.text, doc.frontmatterEndOffset);
    const endLine = bodyStart.character === 0 ? bodyStart.line - 1 : bodyStart.line;
    builder.add(0, endLine, 'region');
  }

  private addHeadingFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    const headings = [...doc.index.headings].sort(
      (a, b) => a.range.start.line - b.range.start.line,
    );
    const lastLine = this.lineCount(doc.text) - 1;

    for (let index = 0; index < headings.length; index++) {
      const heading = headings[index];
      const nextPeer = headings
        .slice(index + 1)
        .find((candidate) => candidate.level <= heading.level);
      const endLine = nextPeer === undefined ? lastLine : nextPeer.range.start.line - 1;
      builder.add(heading.range.start.line, endLine, 'region');
    }
  }

  private addCalloutFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    const lines = doc.text.split(/\r?\n/);
    for (const callout of doc.index.callouts) {
      const startLine = callout.range.start.line;
      let endLine = startLine;
      for (let line = startLine + 1; line < lines.length; line++) {
        if (blockquoteDepth(lines[line]) < callout.depth) break;
        endLine = line;
      }
      builder.add(startLine, endLine, 'region');
    }
  }

  private addGfmTableFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const table of doc.index.gfmTables ?? []) {
      builder.add(table.range.start.line, table.range.end.line, 'region');
    }
  }

  private addGlfmDescriptionListFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const list of doc.index.glfmDescriptionLists ?? []) {
      builder.add(list.range.start.line, list.range.end.line, 'region');
    }
  }

  private addPandocFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const list of doc.index.pandocDefinitionLists ?? []) {
      builder.add(list.range.start.line, list.range.end.line, 'region');
    }
    for (const div of doc.index.pandocFencedDivs ?? []) {
      builder.add(div.range.start.line, div.range.end.line, 'region');
    }
    for (const block of doc.index.pandocTitleBlocks ?? []) {
      builder.add(block.range.start.line, block.range.end.line, 'region');
    }
  }

  private addMultimarkdownFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    const metadata = doc.index.multimarkdownMetadata ?? [];
    if (metadata.length > 1) {
      builder.add(
        metadata[0].range.start.line,
        metadata[metadata.length - 1].range.end.line,
        'region',
      );
    }
    for (const table of doc.index.multimarkdownTables ?? []) {
      builder.add(table.range.start.line, table.range.end.line, 'region');
    }
  }

  private addMdxFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const element of doc.index.mdxJsxElements ?? []) {
      builder.add(element.range.start.line, element.range.end.line, 'region');
    }
    for (const expression of doc.index.mdxExpressions ?? []) {
      builder.add(expression.range.start.line, expression.range.end.line, 'region');
    }
  }

  private addKramdownFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const list of doc.index.kramdownDefinitionLists ?? []) {
      builder.add(list.range.start.line, list.range.end.line, 'region');
    }
    for (const table of doc.index.kramdownTables ?? []) {
      builder.add(table.range.start.line, table.range.end.line, 'region');
    }
    for (const block of doc.index.kramdownMathBlocks ?? []) {
      builder.add(block.range.start.line, block.range.end.line, 'region');
    }
  }

  private addMarkdownExtraFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const list of doc.index.markdownExtraDefinitionLists ?? []) {
      builder.add(list.range.start.line, list.range.end.line, 'region');
    }
    for (const table of doc.index.markdownExtraTables ?? []) {
      builder.add(table.range.start.line, table.range.end.line, 'region');
    }
    for (const block of doc.index.markdownExtraFencedCodeBlocks ?? []) {
      builder.add(block.range.start.line, block.range.end.line, 'region');
    }
  }

  private addRMarkdownFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const chunk of doc.index.rMarkdownChunks ?? []) {
      builder.add(chunk.range.start.line, chunk.range.end.line, 'region');
    }
  }

  private addRedditFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const table of doc.index.redditTables ?? []) {
      builder.add(table.range.start.line, table.range.end.line, 'region');
    }
  }

  private addOpaqueRegionFolds(doc: OFMDoc, builder: FoldingRangeBuilder): void {
    for (const region of doc.opaqueRegions) {
      const range = rangeFromOffsets(doc.text, region.start, region.end);
      const endLine = range.end.character === 0 ? range.end.line - 1 : range.end.line;
      builder.add(range.start.line, endLine, regionKind(region));
    }
  }

  private lineCount(text: string): number {
    return text.split(/\r?\n/).length;
  }
}

class FoldingRangeBuilder {
  private readonly ranges = new Map<string, FoldingRange>();

  constructor(private readonly lineCount: number) {}

  add(startLine: number, endLine: number, kind: FoldingRange['kind']): void {
    if (startLine < 0 || endLine < 0 || startLine >= this.lineCount || endLine >= this.lineCount) {
      return;
    }
    if (endLine <= startLine) return;

    const range = { startLine, endLine, kind };
    this.ranges.set(`${startLine}:${endLine}:${kind ?? ''}`, range);
  }

  build(): FoldingRange[] {
    return [...this.ranges.values()].sort(
      (left, right) => left.startLine - right.startLine || left.endLine - right.endLine,
    );
  }
}

function regionKind(region: OpaqueRegion): FoldingRange['kind'] {
  return region.kind === 'comment' ? 'comment' : 'region';
}

function blockquoteDepth(line: string): number {
  let depth = 0;
  let index = 0;
  while (index < line.length) {
    while (line[index] === ' ' || line[index] === '\t') index++;
    if (line[index] !== '>') break;
    depth++;
    index++;
    if (line[index] === ' ') index++;
  }
  return depth;
}
