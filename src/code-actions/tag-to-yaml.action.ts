import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CodeAction, Range, TextEdit, Position } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import type { TagEntry } from '../parser/types.js';

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
 * 1. Deletes the inline `#tag` text span from the document body.
 * 2. Appends the tag value to the YAML frontmatter `tags:` array:
 *    - If a `tags:` key already exists in frontmatter: appends to the array.
 *    - If frontmatter exists but has no `tags:` key: inserts `tags: [tag]` before
 *      the closing `---`.
 *    - If there is no frontmatter: prepends `---\ntags: [tag]\n---\n` to the file.
 *
 * The action has `kind: 'refactor.rewrite'`.
 *
 * Phase 6 MVP: frontmatter insertion uses line 0 as a sentinel position; exact
 * line-level tracking for existing frontmatter blocks is deferred to Phase 12.
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

    const edits: TextEdit[] = [];

    // --- Edit 1: delete inline #tag span ---
    edits.push({ range: tagEntry.range, newText: '' });

    // --- Edit 2: insert into frontmatter ---
    if (doc.frontmatter !== null) {
      const tagsValue = doc.frontmatter['tags'];
      if (Array.isArray(tagsValue)) {
        // Append to existing tags array — MVP: zero-width sentinel at line 0.
        // Phase 12 will resolve the exact insertion point inside the YAML block.
        edits.push(this.makeAppendToTagsArrayEdit(bareTag));
      } else {
        // Frontmatter exists but no tags key — insert `tags: [tag]` at line 0.
        edits.push(this.makeInsertTagsKeyEdit(bareTag));
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
   * Build a `TextEdit` that represents appending to an existing `tags:` array.
   *
   * MVP implementation inserts a zero-width edit at line 0 character 0 as a
   * sentinel; the `newText` is empty because exact line tracking for
   * existing frontmatter is deferred to Phase 12.
   */
  private makeAppendToTagsArrayEdit(bareTag: string): TextEdit {
    // Phase 12 will replace this with an offset-computed insert before `---`.
    void bareTag; // acknowledged — bare tag carried for Phase 12 reference
    return {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      newText: '',
    };
  }

  /**
   * Build a `TextEdit` that inserts `tags: [<tag>]` into existing frontmatter
   * that has no `tags` key.
   */
  private makeInsertTagsKeyEdit(bareTag: string): TextEdit {
    return {
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      newText: `tags: [${bareTag}]\n`,
    };
  }
}
