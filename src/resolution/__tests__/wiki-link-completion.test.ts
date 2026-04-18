import { describe, it, expect, beforeEach } from '@jest/globals';
import { WikiLinkCompletionProvider } from '../wiki-link-completion-provider.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

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

describe('WikiLinkCompletionProvider', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let provider: WikiLinkCompletionProvider;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    provider = new WikiLinkCompletionProvider(folderLookup, vaultIndex);
  });

  it('returns all docs as completions when partial is empty', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md'));
    vaultIndex.set(id('notes/beta'), makeDoc('file:///v/notes/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const { items, isIncomplete } = provider.getCompletions('');

    expect(items).toHaveLength(2);
    expect(isIncomplete).toBe(false);
  });

  it('filters by stem prefix (case-insensitive)', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md'));
    vaultIndex.set(id('beta'), makeDoc('file:///v/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const { items } = provider.getCompletions('al');

    expect(items).toHaveLength(1);
    expect(items[0].label).toBe('alpha');
  });

  it('case-insensitive prefix matching', () => {
    vaultIndex.set(id('Alpha'), makeDoc('file:///v/Alpha.md'));
    folderLookup.rebuild(vaultIndex);

    const { items } = provider.getCompletions('al');

    expect(items).toHaveLength(1);
  });

  it('item has kind 17 (File) and detail set to vault-relative path', () => {
    vaultIndex.set(id('notes/gamma'), makeDoc('file:///v/notes/gamma.md'));
    folderLookup.rebuild(vaultIndex);

    const { items } = provider.getCompletions('');

    expect(items[0].kind).toBe(17);
    expect(items[0].detail).toBe('notes/gamma');
    expect(items[0].label).toBe('gamma');
  });

  it('caps at 100 items and sets isIncomplete=true', () => {
    for (let i = 0; i < 110; i++) {
      vaultIndex.set(id(`doc${i}`), makeDoc(`file:///v/doc${i}.md`));
    }
    folderLookup.rebuild(vaultIndex);

    const { items, isIncomplete } = provider.getCompletions('');

    expect(items).toHaveLength(100);
    expect(isIncomplete).toBe(true);
  });

  it('returns empty items when no match', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md'));
    folderLookup.rebuild(vaultIndex);

    const { items, isIncomplete } = provider.getCompletions('zzz');

    expect(items).toHaveLength(0);
    expect(isIncomplete).toBe(false);
  });
});
