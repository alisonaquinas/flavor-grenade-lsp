import { describe, it, expect, beforeEach } from '@jest/globals';
import { LinkResolver } from '../link-resolver.js';
import { Oracle } from '../oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, WikiLinkEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

const ZERO_RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 10 },
};

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

describe('LinkResolver', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let resolver: LinkResolver;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    resolver = new LinkResolver(oracle);
  });

  it('resolves a wiki link that exists in the index', () => {
    vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const entry: WikiLinkEntry = {
      raw: '[[beta]]',
      target: 'beta',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.sourceDocId).toBe('alpha');
    expect(ref.entry).toBe(entry);
    expect(ref.resolvedTo).toBe('beta');
  });

  it('sets resolvedTo null for a broken link', () => {
    folderLookup.rebuild(vaultIndex);

    const entry: WikiLinkEntry = {
      raw: '[[nonexistent]]',
      target: 'nonexistent',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();
  });

  it('sets resolvedTo null for ambiguous link', () => {
    vaultIndex.set(id('notes/gamma'), makeDoc('file:///vault/notes/gamma.md'));
    vaultIndex.set(id('other/gamma'), makeDoc('file:///vault/other/gamma.md'));
    folderLookup.rebuild(vaultIndex);

    const entry: WikiLinkEntry = {
      raw: '[[gamma]]',
      target: 'gamma',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();
  });

  it('sets resolvedTo null for malformed link', () => {
    folderLookup.rebuild(vaultIndex);

    const entry: WikiLinkEntry = {
      raw: '[[  ]]',
      target: '  ',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();
  });

  it('delegates heading and blockRef to oracle', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
    folderLookup.rebuild(vaultIndex);

    const entry: WikiLinkEntry = {
      raw: '[[alpha#My Heading]]',
      target: 'alpha',
      heading: 'My Heading',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('beta'));
    expect(ref.resolvedTo).toBe('alpha');
  });
});
