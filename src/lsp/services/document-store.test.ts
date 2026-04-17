import { describe, expect, it } from '@jest/globals';
import { DocumentStore } from './document-store.js';

describe('DocumentStore', () => {
  it('open stores a document retrievable by uri', () => {
    const store = new DocumentStore();
    store.open('file:///test.md', 'markdown', 1, '# Hello');

    const doc = store.get('file:///test.md');
    expect(doc).toBeDefined();
    expect(doc!.getText()).toBe('# Hello');
  });

  it('get returns undefined for an unknown uri', () => {
    const store = new DocumentStore();
    expect(store.get('file:///unknown.md')).toBeUndefined();
  });

  it('update applies full-text change correctly', () => {
    const store = new DocumentStore();
    store.open('file:///test.md', 'markdown', 1, '# Hello');

    store.update('file:///test.md', [{ text: '# Updated' }], 2);

    const doc = store.get('file:///test.md');
    expect(doc!.getText()).toBe('# Updated');
  });

  it('close removes the document', () => {
    const store = new DocumentStore();
    store.open('file:///test.md', 'markdown', 1, '# Hello');
    store.close('file:///test.md');

    expect(store.get('file:///test.md')).toBeUndefined();
  });

  it('update on unknown uri is a no-op (does not throw)', () => {
    const store = new DocumentStore();
    expect(() => {
      store.update('file:///nonexistent.md', [{ text: 'x' }], 1);
    }).not.toThrow();
  });

  it('close on unknown uri is a no-op (does not throw)', () => {
    const store = new DocumentStore();
    expect(() => {
      store.close('file:///nonexistent.md');
    }).not.toThrow();
  });
});
