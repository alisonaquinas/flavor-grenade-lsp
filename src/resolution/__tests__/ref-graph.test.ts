import { describe, it, expect, beforeEach } from '@jest/globals';
import { RefGraph } from '../ref-graph.js';
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

function makeWikiLink(target: string): WikiLinkEntry {
  return { raw: `[[${target}]]`, target, range: ZERO_RANGE };
}

function makeDoc(uri: string, wikiLinks: WikiLinkEntry[] = []): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: { wikiLinks, embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

describe('RefGraph', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
  });

  it('rebuild populates refs from all docs in VaultIndex', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md', [makeWikiLink('beta')]));
    vaultIndex.set(id('beta'), makeDoc('file:///v/beta.md'));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const refs = refGraph.getRefsTo(id('beta'));
    expect(refs).toHaveLength(1);
    expect(refs[0].sourceDocId).toBe('alpha');
    expect(refs[0].entry.target).toBe('beta');
    expect(refs[0].resolvedTo).toBe('beta');
  });

  it('getUnresolvedRefs returns refs with resolvedTo null', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md', [makeWikiLink('nonexistent')]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const unresolved = refGraph.getUnresolvedRefs();
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0].entry.target).toBe('nonexistent');
    expect(unresolved[0].resolvedTo).toBeNull();
  });

  it('getAmbiguousRefs returns refs for ambiguous links', () => {
    vaultIndex.set(id('notes/gamma'), makeDoc('file:///v/notes/gamma.md'));
    vaultIndex.set(id('other/gamma'), makeDoc('file:///v/other/gamma.md'));
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md', [makeWikiLink('gamma')]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const ambiguous = refGraph.getAmbiguousRefs();
    expect(ambiguous).toHaveLength(1);
    expect(ambiguous[0].entry.target).toBe('gamma');
    expect(ambiguous[0].resolvedTo).toBeNull();
  });

  it('getRefsTo returns empty array when no refs point to docId', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md'));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    expect(refGraph.getRefsTo(id('alpha'))).toHaveLength(0);
  });

  it('rebuild clears previous state', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md', [makeWikiLink('beta')]));
    vaultIndex.set(id('beta'), makeDoc('file:///v/beta.md'));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    // Remove alpha (source of the ref) and rebuild
    vaultIndex.delete(id('alpha'));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    expect(refGraph.getRefsTo(id('beta'))).toHaveLength(0);
  });

  it('multiple refs can point to the same target', () => {
    vaultIndex.set(id('beta'), makeDoc('file:///v/beta.md'));
    vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md', [makeWikiLink('beta')]));
    vaultIndex.set(id('notes/gamma'), makeDoc('file:///v/notes/gamma.md', [makeWikiLink('beta')]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const refs = refGraph.getRefsTo(id('beta'));
    expect(refs).toHaveLength(2);
  });
});
