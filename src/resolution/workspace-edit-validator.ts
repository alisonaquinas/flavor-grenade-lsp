import type { Range } from 'vscode-languageserver-types';
import { WorkspaceEditBuilder } from '../handlers/workspace-edit-builder.js';
import type { WorkspaceEdit } from '../handlers/workspace-edit-builder.js';
import type {
  FileOperationRewriteResult,
  SkippedFileOperationReference,
} from './file-operation-rewriter.js';

export type WorkspaceEditValidationResult =
  | {
      status: 'ok';
      edit: WorkspaceEdit;
      skipped: SkippedFileOperationReference[];
    }
  | {
      status: 'rejected';
      reason: string;
      skipped: SkippedFileOperationReference[];
    };

/**
 * Validates the complete file-operation edit set before it reaches the client.
 */
export class WorkspaceEditValidator {
  validate(rewrite: FileOperationRewriteResult): WorkspaceEditValidationResult {
    const byUri = new Map<string, Range[]>();
    for (const edit of rewrite.edits) {
      if (!isValidRange(edit.range)) {
        return { status: 'rejected', reason: 'Invalid text edit range', skipped: rewrite.skipped };
      }

      const ranges = byUri.get(edit.uri) ?? [];
      ranges.push(edit.range);
      byUri.set(edit.uri, ranges);
    }

    for (const ranges of byUri.values()) {
      if (hasOverlap(ranges)) {
        return { status: 'rejected', reason: 'Overlapping text edits', skipped: rewrite.skipped };
      }
    }

    const builder = new WorkspaceEditBuilder();
    for (const edit of rewrite.edits) {
      builder.addTextEdit(edit.uri, { range: edit.range, newText: edit.newText });
    }

    return { status: 'ok', edit: builder.build(), skipped: rewrite.skipped };
  }
}

function hasOverlap(ranges: readonly Range[]): boolean {
  const sorted = [...ranges].sort((a, b) => compareRangeStart(a, b));
  for (let i = 1; i < sorted.length; i += 1) {
    if (comparePosition(sorted[i].start, sorted[i - 1].end) < 0) {
      return true;
    }
  }
  return false;
}

function isValidRange(range: Range): boolean {
  return (
    range.start.line >= 0 &&
    range.start.character >= 0 &&
    range.end.line >= 0 &&
    range.end.character >= 0 &&
    comparePosition(range.start, range.end) <= 0
  );
}

function compareRangeStart(a: Range, b: Range): number {
  return comparePosition(a.start, b.start);
}

function comparePosition(
  a: { line: number; character: number },
  b: { line: number; character: number },
): number {
  const lineDiff = a.line - b.line;
  if (lineDiff !== 0) return lineDiff;
  return a.character - b.character;
}
