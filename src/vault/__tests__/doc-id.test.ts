import { describe, it, expect } from '@jest/globals';
import * as path from 'path';
import { toDocId, fromDocId } from '../doc-id.js';
import type { DocId } from '../doc-id.js';

describe('toDocId', () => {
  it('produces a relative path without extension using forward slashes', () => {
    const root = '/vault/root';
    const abs = '/vault/root/notes/MyNote.md';
    const id = toDocId(root, abs);
    expect(id).toBe('notes/MyNote');
  });

  it('works for a file at vault root level', () => {
    const root = '/vault/root';
    const abs = '/vault/root/README.md';
    const id = toDocId(root, abs);
    expect(id).toBe('README');
  });

  it('strips .md extension from deeply nested file', () => {
    const root = '/vault';
    const abs = '/vault/a/b/c/deep.md';
    const id = toDocId(root, abs);
    expect(id).toBe('a/b/c/deep');
  });

  it('preserves non-.md extensions in docId', () => {
    const root = '/vault';
    const abs = '/vault/image.png';
    const id = toDocId(root, abs);
    expect(id).toBe('image.png');
  });

  it('uses forward slashes even on Windows-style paths (normalized inputs)', () => {
    // Simulate normalized absolute path (path.relative always gives OS separators)
    const root = '/vault/root';
    const abs = '/vault/root/folder/file.md';
    const id = toDocId(root, abs);
    expect(id).not.toContain('\\');
    expect(id).toBe('folder/file');
  });
});

describe('fromDocId', () => {
  it('reconstructs absolute path adding .md extension', () => {
    const root = '/vault/root';
    const id = 'notes/MyNote' as DocId;
    const result = fromDocId(root, id);
    expect(result).toBe(path.join('/vault/root', 'notes/MyNote.md'));
  });

  it('does not add .md when docId already has extension', () => {
    const root = '/vault/root';
    const id = 'image.png' as DocId;
    const result = fromDocId(root, id);
    expect(result).toBe(path.join('/vault/root', 'image.png'));
  });

  it('round-trips toDocId → fromDocId for .md files', () => {
    const root = '/vault';
    const original = '/vault/notes/plan.md';
    const id = toDocId(root, original);
    const recovered = fromDocId(root, id);
    expect(recovered).toBe(path.normalize(original));
  });
});
