import { describe, it, expect, beforeEach } from '@jest/globals';
import { WorkspaceEditBuilder } from '../workspace-edit-builder.js';
import type { RenameFileChange } from '../workspace-edit-builder.js';

const R = (sl: number, sc: number, el: number, ec: number): { start: { line: number; character: number }; end: { line: number; character: number } } => ({
  start: { line: sl, character: sc },
  end: { line: el, character: ec },
});

describe('WorkspaceEditBuilder', () => {
  let builder: WorkspaceEditBuilder;

  beforeEach(() => {
    builder = new WorkspaceEditBuilder();
  });

  it('builds empty WorkspaceEdit when nothing is added', () => {
    const result = builder.build();
    expect(result.changes).toEqual({});
    expect(result.documentChanges).toBeUndefined();
  });

  it('accumulates text edits for a single URI', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'Hello' });
    builder.addTextEdit('file:///vault/alpha.md', { range: R(2, 0, 2, 3), newText: 'Bye' });
    const result = builder.build();
    expect(result.changes['file:///vault/alpha.md']).toHaveLength(2);
  });

  it('accumulates text edits for multiple URIs', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'A' });
    builder.addTextEdit('file:///vault/beta.md', { range: R(1, 0, 1, 5), newText: 'B' });
    const result = builder.build();
    expect(Object.keys(result.changes)).toHaveLength(2);
  });

  it('deduplicates edits at the same range (last-write-wins)', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'First' });
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'Second' });
    const result = builder.build();
    const edits = result.changes['file:///vault/alpha.md'];
    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toBe('Second');
  });

  it('sorts edits per URI in reverse line order (line descending)', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'A' });
    builder.addTextEdit('file:///vault/alpha.md', { range: R(5, 0, 5, 3), newText: 'B' });
    builder.addTextEdit('file:///vault/alpha.md', { range: R(2, 0, 2, 3), newText: 'C' });
    const result = builder.build();
    const edits = result.changes['file:///vault/alpha.md'];
    expect(edits[0].range.start.line).toBe(5);
    expect(edits[1].range.start.line).toBe(2);
    expect(edits[2].range.start.line).toBe(0);
  });

  it('sorts edits on same line by character descending', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(3, 0, 3, 5), newText: 'A' });
    builder.addTextEdit('file:///vault/alpha.md', { range: R(3, 10, 3, 15), newText: 'B' });
    const result = builder.build();
    const edits = result.changes['file:///vault/alpha.md'];
    expect(edits[0].range.start.character).toBe(10);
    expect(edits[1].range.start.character).toBe(0);
  });

  it('includes RenameFile changes in documentChanges', () => {
    const change: RenameFileChange = {
      kind: 'rename',
      oldUri: 'file:///vault/old.md',
      newUri: 'file:///vault/new.md',
    };
    builder.addRenameFile(change);
    const result = builder.build();
    expect(result.documentChanges).toBeDefined();
    expect(result.documentChanges).toHaveLength(1);
    expect(result.documentChanges![0]).toEqual(change);
  });

  it('combines text edits and rename file changes in same build', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'New' });
    builder.addRenameFile({ kind: 'rename', oldUri: 'file:///vault/old.md', newUri: 'file:///vault/new.md' });
    const result = builder.build();
    expect(result.changes['file:///vault/alpha.md']).toHaveLength(1);
    expect(result.documentChanges).toHaveLength(1);
  });

  it('does not include documentChanges when no rename file changes added', () => {
    builder.addTextEdit('file:///vault/alpha.md', { range: R(0, 0, 0, 5), newText: 'A' });
    const result = builder.build();
    expect(result.documentChanges).toBeUndefined();
  });
});
