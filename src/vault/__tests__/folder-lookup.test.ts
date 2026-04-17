import { describe, it, expect, beforeEach } from '@jest/globals';
import { FolderLookup } from '../folder-lookup.js';
import { VaultIndex } from '../vault-index.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../doc-id.js';

function makeDoc(uri: string): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

function id(s: string): DocId {
  return s as DocId;
}

describe('FolderLookup', () => {
  let vaultIndex: VaultIndex;
  let lookup: FolderLookup;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    lookup = new FolderLookup();
  });

  it('lookupByStem returns doc at vault root level by stem', () => {
    vaultIndex.set(id('README'), makeDoc('file:///vault/README.md'));
    lookup.rebuild(vaultIndex);
    const results = lookup.lookupByStem('README');
    expect(results).toContain('README');
    expect(results).toHaveLength(1);
  });

  it('lookupByStem returns nested doc by its last path segment', () => {
    vaultIndex.set(id('notes/daily/plan'), makeDoc('file:///vault/notes/daily/plan.md'));
    lookup.rebuild(vaultIndex);
    const results = lookup.lookupByStem('plan');
    expect(results).toContain('notes/daily/plan');
    expect(results).toHaveLength(1);
  });

  it('lookupByStem returns multiple results for ambiguous stem', () => {
    vaultIndex.set(id('notes/plan'), makeDoc('file:///vault/notes/plan.md'));
    vaultIndex.set(id('archive/plan'), makeDoc('file:///vault/archive/plan.md'));
    lookup.rebuild(vaultIndex);
    const results = lookup.lookupByStem('plan');
    expect(results).toHaveLength(2);
    expect(results).toContain('notes/plan');
    expect(results).toContain('archive/plan');
  });

  it('lookupByPath returns unique result for path-qualified stem', () => {
    vaultIndex.set(id('notes/plan'), makeDoc('file:///vault/notes/plan.md'));
    vaultIndex.set(id('archive/plan'), makeDoc('file:///vault/archive/plan.md'));
    lookup.rebuild(vaultIndex);
    const results = lookup.lookupByPath('notes/plan');
    expect(results).toHaveLength(1);
    expect(results).toContain('notes/plan');
  });

  it('lookupByPath returns empty array when no match', () => {
    vaultIndex.set(id('notes/plan'), makeDoc('file:///vault/notes/plan.md'));
    lookup.rebuild(vaultIndex);
    expect(lookup.lookupByPath('archive/plan')).toHaveLength(0);
  });

  it('lookupByStem returns empty array when no match', () => {
    lookup.rebuild(vaultIndex);
    expect(lookup.lookupByStem('nonexistent')).toHaveLength(0);
  });

  it('rebuild replaces previous lookup state', () => {
    vaultIndex.set(id('notes/plan'), makeDoc('file:///vault/notes/plan.md'));
    lookup.rebuild(vaultIndex);
    expect(lookup.lookupByStem('plan')).toHaveLength(1);

    vaultIndex.clear();
    lookup.rebuild(vaultIndex);
    expect(lookup.lookupByStem('plan')).toHaveLength(0);
  });
});
