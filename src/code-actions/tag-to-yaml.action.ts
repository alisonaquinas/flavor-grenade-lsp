import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CodeAction, Range, TextEdit, Position } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import type { TagEntry, OFMDoc } from '../parser/types.js';

/**
 * Parameters for a `textDocument/codeAction` request (subset used here).
 */
interface CodeActionParams {
  textDocument: { uri: string };
  range: Range;
}

/**
 * Implements the "Move tag to frontmatter" code action.
 *
 * When the cursor is positioned on an inline `#tag`, this action produces a
 * {@link CodeAction} that:
 *
 * 1. Deletes ALL inline occurrences of the `#tag` from the document body.
 * 2. Appends the tag value to the YAML frontmatter `tags:` array:
 *    - If `tags:` array already contains the tag: returns an informational action.
 *    - If a `tags:` key already exists in frontmatter: appends to the array.
 *    - If frontmatter exists but has no `tags:` key: inserts `tags: [tag]` before
 *      the closing `---`.
 *    - If there is no frontmatter: prepends `---\ntags: [tag]\n---\n` to the file.
 *
 * The action has `kind: 'refactor.rewrite'`.
 */
@Injectable()
export class TagToYamlAction {
  constructor(private readonly parseCache: ParseCache) {}

  /**
   * Handle a `textDocument/codeAction` request.
   *
   * @param params - Code action parameters containing document URI and cursor range.
   * @returns A {@link CodeAction} if the cursor is on an inline tag, or `null`.
   */
  handle(params: CodeActionParams): CodeAction | null {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return null;

    const tagEntry = this.findTagAtPosition(doc.index.tags, params.range.start);
    if (tagEntry === null) return null;

    // Strip the leading '#' to get the bare tag name for YAML insertion.
    const bareTag = tagEntry.tag.slice(1);

    // Edge case: tag already in frontmatter
    if (doc.frontmatter !== null) {
      const tagsValue = doc.frontmatter['tags'];
      if (Array.isArray(tagsValue) && (tagsValue as unknown[]).includes(bareTag)) {
        return {
          title: 'Tag already in frontmatter',
          kind: '',
          edit: undefined,
        };
      }
    }

    const edits: TextEdit[] = [];

    // --- Edit 1: delete ALL inline occurrences of this tag ---
    const allOccurrences = doc.index.tags.filter((e) => e.tag === tagEntry.tag);
    for (const occurrence of allOccurrences) {
      edits.push({ range: occurrence.range, newText: '' });
    }

    // --- Edit 2: insert into frontmatter ---
    if (doc.frontmatter !== null) {
      const tagsValue = doc.frontmatter['tags'];
      if (Array.isArray(tagsValue)) {
        // Append to existing tags array
        edits.push(this.makeAppendToTagsArrayEdit(bareTag, doc));
      } else {
        // Frontmatter exists but no tags key — insert `tags: [tag]` before closing ---
        edits.push(this.makeInsertTagsKeyEdit(bareTag, doc));
      }
    } else {
      // No frontmatter — prepend a new frontmatter block.
      edits.push({
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        newText: `---\ntags: [${bareTag}]\n---\n`,
      });
    }

    const changes: { [uri: string]: TextEdit[] } = {};
    changes[params.textDocument.uri] = edits;

    return {
      title: `Move #${bareTag} to frontmatter`,
      kind: 'refactor.rewrite',
      edit: { changes },
    };
  }

  // ────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────

  private findTagAtPosition(tags: TagEntry[], position: Position): TagEntry | null {
    for (const entry of tags) {
      if (this.positionInRange(position, entry.range)) return entry;
    }
    return null;
  }

  private positionInRange(position: Position, range: Range): boolean {
    const { start, end } = range;
    if (position.line < start.line || position.line > end.line) return false;
    if (position.line === start.line && position.character < start.character) return false;
    if (position.line === end.line && position.character > end.character) return false;
    return true;
  }

  /**
   * Find the line number of the closing `---` of the frontmatter block.
   * Returns -1 if not found.
   */
  private findFrontmatterClosingLine(doc: OFMDoc): number {
    const lines = doc.text.split('\n');
    // Line 0 is the opening `---`, search for the second `---`
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trimEnd() === '---') {
        return i;
      }
    }
    return -1;
  }

  /**
   * Build a `TextEdit` that appends `bareTag` to the existing `tags: [...]` array.
   *
   * If the tags are on a line like `tags: [a, b]`, replaces that line with
   * `tags: [a, b, bareTag]`.
   * Otherwise falls back to inserting before the closing `---`.
   */
  private makeAppendToTagsArrayEdit(bareTag: string, doc: OFMDoc): TextEdit {
    const lines = doc.text.split('\n');
    const closingLine = this.findFrontmatterClosingLine(doc);

    // Find the `tags:` line within frontmatter
    const searchEnd = closingLine === -1 ? lines.length : closingLine;
    for (let i = 1; i < searchEnd; i++) {
      const line = lines[i];
      const tagsMatch = /^(tags:\s*\[)(.*)(\].*)$/.exec(line);
      if (tagsMatch !== null) {
        const prefix = tagsMatch[1];
        const existing = tagsMatch[2].trim();
        const suffix = tagsMatch[3];
        const newContent = existing.length > 0 ? `${existing}, ${bareTag}` : bareTag;
        const newLine = `${prefix}${newContent}${suffix}`;
        return {
          range: {
            start: { line: i, character: 0 },
            end: { line: i, character: line.length },
          },
          newText: newLine,
        };
      }
    }

    // Fallback: insert before closing ---
    if (closingLine !== -1) {
      return {
        range: {
          start: { line: closingLine, character: 0 },
          end: { line: closingLine, character: 0 },
        },
        newText: `- ${bareTag}\n`,
      };
    }

    // Last resort sentinel
    return {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      newText: '',
    };
  }

  /**
   * Build a `TextEdit` that inserts `tags: [<tag>]` into existing frontmatter
   * that has no `tags` key — inserted before the closing `---`.
   */
  private makeInsertTagsKeyEdit(bareTag: string, doc: OFMDoc): TextEdit {
    const closingLine = this.findFrontmatterClosingLine(doc);

    if (closingLine !== -1) {
      return {
        range: {
          start: { line: closingLine, character: 0 },
          end: { line: closingLine, character: 0 },
        },
        newText: `tags: [${bareTag}]\n`,
      };
    }

    // Fallback sentinel (shouldn't happen in well-formed frontmatter)
    return {
      range: { start: { line: 1, character: 0 }, end: { line: 1, character: 0 } },
      newText: `tags: [${bareTag}]\n`,
    };
  }
}
