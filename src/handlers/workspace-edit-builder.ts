import type { Range } from 'vscode-languageserver-types';

/**
 * A single text replacement within a document.
 */
export interface TextEdit {
  /** LSP range to replace. */
  range: Range;
  /** Replacement text. */
  newText: string;
}

/**
 * An LSP `RenameFile` document change (file rename operation).
 */
export interface RenameFileChange {
  kind: 'rename';
  oldUri: string;
  newUri: string;
}

/**
 * The LSP `WorkspaceEdit` structure.
 *
 * `changes` maps document URIs to arrays of {@link TextEdit}.
 * `documentChanges` carries {@link RenameFileChange} operations, present only
 * when at least one rename-file change was added.
 */
export interface WorkspaceEdit {
  changes: Record<string, TextEdit[]>;
  documentChanges?: RenameFileChange[];
}

/**
 * Serialisable key for deduplicating edits at the same range.
 */
function rangeKey(range: Range): string {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
}

/**
 * Accumulates text edits (keyed by URI) and optional rename-file document
 * changes, then produces a final {@link WorkspaceEdit}.
 *
 * Guarantees:
 * - Edits targeting the same URI and same range are deduplicated; the last
 *   added value wins.
 * - Edits per URI are sorted in reverse line order (line descending, then
 *   character descending) so that applying them top-to-bottom (or delegating
 *   to the editor) keeps earlier offsets valid.
 *
 * This is a plain class — instantiate with `new WorkspaceEditBuilder()` per
 * rename request.
 */
export class WorkspaceEditBuilder {
  /** Maps URI → (rangeKey → TextEdit), enabling O(1) deduplication. */
  private readonly editsByUri = new Map<string, Map<string, TextEdit>>();
  private readonly renames: RenameFileChange[] = [];

  /**
   * Add a text edit for the given URI.
   *
   * If an edit already exists for the same URI and range, it is replaced by
   * this one (last-write-wins).
   *
   * @param uri  - Document URI.
   * @param edit - The text edit to apply.
   */
  addTextEdit(uri: string, edit: TextEdit): void {
    let byRange = this.editsByUri.get(uri);
    if (byRange === undefined) {
      byRange = new Map<string, TextEdit>();
      this.editsByUri.set(uri, byRange);
    }
    byRange.set(rangeKey(edit.range), edit);
  }

  /**
   * Add a rename-file document change.
   *
   * @param change - The rename operation descriptor.
   */
  addRenameFile(change: RenameFileChange): void {
    this.renames.push(change);
  }

  /**
   * Produce the final {@link WorkspaceEdit}.
   *
   * Text edits are sorted per URI in reverse line/character order (highest
   * position first) so multi-edit sequences can be applied without offset drift.
   */
  build(): WorkspaceEdit {
    const changes: Record<string, TextEdit[]> = {};

    for (const [uri, byRange] of this.editsByUri) {
      const edits = Array.from(byRange.values());
      edits.sort((a, b) => {
        const lineDiff = b.range.start.line - a.range.start.line;
        if (lineDiff !== 0) return lineDiff;
        return b.range.start.character - a.range.start.character;
      });
      changes[uri] = edits;
    }

    const result: WorkspaceEdit = { changes };
    if (this.renames.length > 0) {
      result.documentChanges = [...this.renames];
    }
    return result;
  }
}
