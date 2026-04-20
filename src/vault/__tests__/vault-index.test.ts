import { describe, it, expect, beforeEach } from '@jest/globals';
import { VaultIndex } from '../vault-index.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../doc-id.js';

function makeDoc(uri: string): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

function id(s: string): DocId {
  return s as DocId;
}

describe('VaultIndex', () => {
  let index: VaultIndex;

  beforeEach(() => {
    index = new VaultIndex();
  });

  it('starts empty', () => {
    expect(index.size()).toBe(0);
  });

  it('set and get round-trip', () => {
    const doc = makeDoc('file:///vault/notes/a.md');
    index.set(id('notes/a'), doc);
    expect(index.get(id('notes/a'))).toBe(doc);
  });

  it('has returns true after set', () => {
    index.set(id('notes/a'), makeDoc('file:///vault/notes/a.md'));
    expect(index.has(id('notes/a'))).toBe(true);
  });

  it('has returns false for unknown id', () => {
    expect(index.has(id('unknown'))).toBe(false);
  });

  it('delete removes entry', () => {
    index.set(id('notes/a'), makeDoc('file:///vault/notes/a.md'));
    index.delete(id('notes/a'));
    expect(index.has(id('notes/a'))).toBe(false);
    expect(index.size()).toBe(0);
  });

  it('size tracks count correctly', () => {
    index.set(id('a'), makeDoc('file:///a.md'));
    index.set(id('b'), makeDoc('file:///b.md'));
    expect(index.size()).toBe(2);
    index.delete(id('a'));
    expect(index.size()).toBe(1);
  });

  it('values iterates all docs', () => {
    const docA = makeDoc('file:///a.md');
    const docB = makeDoc('file:///b.md');
    index.set(id('a'), docA);
    index.set(id('b'), docB);
    const values = [...index.values()];
    expect(values).toContain(docA);
    expect(values).toContain(docB);
    expect(values).toHaveLength(2);
  });

  it('entries iterates all [id, doc] pairs', () => {
    const doc = makeDoc('file:///notes/x.md');
    index.set(id('notes/x'), doc);
    const entries = [...index.entries()];
    expect(entries).toHaveLength(1);
    expect(entries[0][0]).toBe('notes/x');
    expect(entries[0][1]).toBe(doc);
  });

  it('clear removes all entries', () => {
    index.set(id('a'), makeDoc('file:///a.md'));
    index.set(id('b'), makeDoc('file:///b.md'));
    index.clear();
    expect(index.size()).toBe(0);
    expect([...index.values()]).toHaveLength(0);
  });
});
