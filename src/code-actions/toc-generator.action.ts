import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CodeAction, TextEdit, Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import type { HeadingEntry } from '../parser/types.js';

interface CodeActionParams {
  textDocument: { uri: string };
  range: Range;
  context?: { diagnostics: unknown[] };
}

/**
 * Generates or replaces a Table of Contents in the document.
 *
 * The TOC is built from H2+ headings (H1 is the document title and is skipped).
 * Indentation: H2 = no indent, H3 = 2 spaces, H4 = 4 spaces, etc.
 *
 * If a heading with text "Table of Contents" already exists, the action is
 * "Replace Table of Contents" — it replaces the TOC block.
 * Otherwise it is "Generate Table of Contents" — it inserts after the first heading.
 */
@Injectable()
export class TocGeneratorAction {
  constructor(private readonly parseCache: ParseCache) {}

  handle(params: CodeActionParams): CodeAction | null {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return null;

    const headings = doc.index.headings;
    if (headings.length === 0) return null;

    // Check for existing TOC
    const tocHeadingIdx = headings.findIndex((h) => h.text === 'Table of Contents');
    const hasToc = tocHeadingIdx !== -1;

    // Build TOC content from H2+ headings (skip H1 and the TOC heading itself)
    const tocEntries = headings.filter(
      (h, idx) => h.level >= 2 && h.text !== 'Table of Contents' && idx !== tocHeadingIdx,
    );

    if (tocEntries.length === 0 && !hasToc) return null;

    const tocContent = this.buildTocContent(tocEntries);

    const uri = params.textDocument.uri;
    let edit: TextEdit;

    if (hasToc) {
      // Replace existing TOC block
      const tocHeading = headings[tocHeadingIdx];
      const tocStartLine = tocHeading.range.start.line;

      // Find the end of the TOC block: next heading of same or higher level, or end of doc
      const tocLevel = tocHeading.level;
      const nextSectionIdx = headings.findIndex(
        (h, idx) => idx > tocHeadingIdx && h.level <= tocLevel && h.text !== 'Table of Contents',
      );

      let tocEndLine: number;
      if (nextSectionIdx !== -1) {
        // End just before the next section heading
        tocEndLine = headings[nextSectionIdx].range.start.line;
      } else {
        // TOC extends to end of document
        const lines = doc.text.split('\n');
        tocEndLine = lines.length;
      }

      edit = {
        range: {
          start: { line: tocStartLine, character: 0 },
          end: { line: tocEndLine, character: 0 },
        },
        newText: tocContent,
      };
    } else {
      // Insert after the first heading
      const firstHeading = headings[0];
      const insertLine = firstHeading.range.end.line + 1;

      edit = {
        range: {
          start: { line: insertLine, character: 0 },
          end: { line: insertLine, character: 0 },
        },
        newText: tocContent,
      };
    }

    const changes: { [u: string]: TextEdit[] } = {};
    changes[uri] = [edit];

    const title = hasToc ? 'Replace Table of Contents' : 'Generate Table of Contents';
    const commandName = hasToc ? 'fg.tocReplace' : 'fg.toc';

    return {
      title,
      kind: hasToc ? 'source.fg.tocReplace' : 'source.fg.toc',
      command: {
        title,
        command: commandName,
        arguments: [uri],
      },
      edit: { changes },
    };
  }

  private buildTocContent(entries: HeadingEntry[]): string {
    if (entries.length === 0) {
      return '## Table of Contents\n\n';
    }

    const lines: string[] = ['## Table of Contents'];
    for (const entry of entries) {
      // H2 → 0 indent, H3 → 2 spaces, H4 → 4 spaces, etc.
      const indent = '  '.repeat(entry.level - 2);
      lines.push(`${indent}- [[#${entry.text}]]`);
    }
    lines.push('');
    lines.push('');

    return lines.join('\n');
  }
}
