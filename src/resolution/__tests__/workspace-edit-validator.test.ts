import { describe, expect, it } from '@jest/globals';
import { WorkspaceEditValidator } from '../workspace-edit-validator.js';
import type { Range } from 'vscode-languageserver-types';
import type { FileOperationRewriteResult } from '../file-operation-rewriter.js';

function range(sl: number, sc: number, el: number, ec: number): Range {
  return {
    start: { line: sl, character: sc },
    end: { line: el, character: ec },
  };
}

describe('WorkspaceEditValidator', () => {
  it('rejects the whole edit when any document has overlapping ranges', () => {
    const rewrite: FileOperationRewriteResult = {
      skipped: [],
      edits: [
        { uri: 'file:///vault/source.md', range: range(0, 0, 0, 5), newText: 'first' },
        { uri: 'file:///vault/source.md', range: range(0, 3, 0, 8), newText: 'second' },
      ],
    };

    expect(new WorkspaceEditValidator().validate(rewrite)).toEqual({
      status: 'rejected',
      reason: 'Overlapping text edits',
      skipped: [],
    });
  });

  it('returns valid edit sets in deterministic reverse document order', () => {
    const rewrite: FileOperationRewriteResult = {
      skipped: [],
      edits: [
        { uri: 'file:///vault/source.md', range: range(0, 0, 0, 5), newText: 'first' },
        { uri: 'file:///vault/source.md', range: range(2, 0, 2, 5), newText: 'third' },
        { uri: 'file:///vault/source.md', range: range(1, 0, 1, 5), newText: 'second' },
      ],
    };

    const result = new WorkspaceEditValidator().validate(rewrite);

    expect(result.status).toBe('ok');
    expect(result.status === 'ok' ? result.edit.changes['file:///vault/source.md'] : []).toEqual([
      { range: range(2, 0, 2, 5), newText: 'third' },
      { range: range(1, 0, 1, 5), newText: 'second' },
      { range: range(0, 0, 0, 5), newText: 'first' },
    ]);
  });

  it('preserves skipped-reference reports without treating them as conflicts', () => {
    const rewrite: FileOperationRewriteResult = {
      skipped: [{ reason: 'Ambiguous reference' }],
      edits: [{ uri: 'file:///vault/source.md', range: range(0, 0, 0, 5), newText: 'first' }],
    };

    const result = new WorkspaceEditValidator().validate(rewrite);

    expect(result.status).toBe('ok');
    expect(result.status === 'ok' ? result.skipped : []).toEqual([
      { reason: 'Ambiguous reference' },
    ]);
  });
});
