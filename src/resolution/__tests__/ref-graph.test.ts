import { describe, it, expect, beforeEach } from '@jest/globals';
import { RefGraph } from '../ref-graph.js';
import { Oracle } from '../oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, WikiLinkEntry, EmbedEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';
import type { EmbedRef, CrossBlockRef, DefKey } from '../ref-graph.js';

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
    text: '',
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

function makeEmbedEntry(target: string, overrides?: Partial<EmbedEntry>): EmbedEntry {
  return {
    raw: `![[${target}]]`,
    target,
    range: ZERO_RANGE,
    ...overrides,
  };
}

function makeWikiLinkEntry(target: string, overrides?: Partial<WikiLinkEntry>): WikiLinkEntry {
  return {
    raw: `[[${target}]]`,
    target,
    range: ZERO_RANGE,
    ...overrides,
  };
}

describe('embed refs', () => {
  let refGraph: RefGraph;

  beforeEach(() => {
    refGraph = new RefGraph();
  });

  it('addEmbedRef stores ref reachable by getEmbedRefsTo when resolvedTo is non-null', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('beta'),
      resolvedTo: 'beta' as DefKey,
      broken: false,
    };
    refGraph.addEmbedRef(ref);

    const results = refGraph.getEmbedRefsTo('beta' as DefKey);
    expect(results).toHaveLength(1);
    expect(results[0].sourceDocId).toBe('alpha');
  });

  it('getEmbedRefsTo returns [] for an unknown key', () => {
    expect(refGraph.getEmbedRefsTo('nonexistent' as DefKey)).toEqual([]);
  });

  it('getBrokenEmbedRefs returns refs with resolvedTo === null', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('missing-image.png'),
      resolvedTo: null,
      broken: true,
    };
    refGraph.addEmbedRef(ref);

    const broken = refGraph.getBrokenEmbedRefs();
    expect(broken).toHaveLength(1);
    expect(broken[0].resolvedTo).toBeNull();
  });

  it('resolved markdown embed stores ref under its targetDocId defKey', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('notes/topic'),
      resolvedTo: 'notes/topic' as DefKey,
      broken: false,
    };
    refGraph.addEmbedRef(ref);

    const results = refGraph.getEmbedRefsTo('notes/topic' as DefKey);
    expect(results).toHaveLength(1);
    expect(results[0].resolvedTo).toBe('notes/topic');
  });

  it('resolved asset embed stores ref under its asset path defKey', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('assets/photo.png'),
      resolvedTo: 'assets/photo.png' as DefKey,
      broken: false,
    };
    refGraph.addEmbedRef(ref);

    const results = refGraph.getEmbedRefsTo('assets/photo.png' as DefKey);
    expect(results).toHaveLength(1);
    expect(results[0].resolvedTo).toBe('assets/photo.png');
  });

  it('broken embed appears in getBrokenEmbedRefs and not in embedRefsMap', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('ghost.md'),
      resolvedTo: null,
      broken: true,
    };
    refGraph.addEmbedRef(ref);

    expect(refGraph.getBrokenEmbedRefs()).toHaveLength(1);
    expect(refGraph.getEmbedRefsTo('ghost.md' as DefKey)).toHaveLength(0);
  });

  it('embed with embedSize.width has width populated', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('image.png', { width: 300 }),
      resolvedTo: 'image.png' as DefKey,
      broken: false,
      embedSize: { width: 300 },
    };
    refGraph.addEmbedRef(ref);

    const results = refGraph.getEmbedRefsTo('image.png' as DefKey);
    expect(results[0].embedSize?.width).toBe(300);
  });

  it('embed with embedSize.width and height has both populated', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('image.png', { width: 400, height: 200 }),
      resolvedTo: 'image.png' as DefKey,
      broken: false,
      embedSize: { width: 400, height: 200 },
    };
    refGraph.addEmbedRef(ref);

    const results = refGraph.getEmbedRefsTo('image.png' as DefKey);
    expect(results[0].embedSize?.width).toBe(400);
    expect(results[0].embedSize?.height).toBe(200);
  });

  it('embed without embedSize has embedSize undefined', () => {
    const ref: EmbedRef = {
      sourceDocId: id('alpha'),
      entry: makeEmbedEntry('doc.md'),
      resolvedTo: 'doc.md' as DefKey,
      broken: false,
    };
    refGraph.addEmbedRef(ref);

    const results = refGraph.getEmbedRefsTo('doc.md' as DefKey);
    expect(results[0].embedSize).toBeUndefined();
  });
});

describe('block refs', () => {
  let refGraph: RefGraph;

  beforeEach(() => {
    refGraph = new RefGraph();
  });

  it('addBlockRef stores ref reachable by getBlockRefsToAnchor', () => {
    const ref: CrossBlockRef = {
      sourceDocId: id('alpha'),
      targetDocId: id('beta'),
      anchorId: 'my-anchor',
      entry: makeWikiLinkEntry('beta', { blockRef: 'my-anchor' }),
      resolvedAnchor: null,
      diagnostic: null,
    };
    refGraph.addBlockRef(ref);

    const results = refGraph.getBlockRefsToAnchor(id('beta'), 'my-anchor');
    expect(results).toHaveLength(1);
    expect(results[0].sourceDocId).toBe('alpha');
    expect(results[0].anchorId).toBe('my-anchor');
  });

  it('getBlockRefsToAnchor returns [] for an unknown key', () => {
    expect(refGraph.getBlockRefsToAnchor(id('nonexistent'), 'no-anchor')).toEqual([]);
  });

  it('getBrokenBlockRefs returns refs with diagnostic === FG005', () => {
    const ref: CrossBlockRef = {
      sourceDocId: id('alpha'),
      targetDocId: id('beta'),
      anchorId: 'ghost-anchor',
      entry: makeWikiLinkEntry('beta', { blockRef: 'ghost-anchor' }),
      resolvedAnchor: null,
      diagnostic: 'FG005',
    };
    refGraph.addBlockRef(ref);

    const broken = refGraph.getBrokenBlockRefs();
    expect(broken).toHaveLength(1);
    expect(broken[0].diagnostic).toBe('FG005');
  });

  it('intra-document block ref (targetDocId null) uses sourceDocId as owner key', () => {
    const ref: CrossBlockRef = {
      sourceDocId: id('alpha'),
      targetDocId: null,
      anchorId: 'local-anchor',
      entry: makeWikiLinkEntry('', { blockRef: 'local-anchor' }),
      resolvedAnchor: null,
      diagnostic: null,
    };
    refGraph.addBlockRef(ref);

    // Owner key is sourceDocId when targetDocId is null
    const results = refGraph.getBlockRefsToAnchor(id('alpha'), 'local-anchor');
    expect(results).toHaveLength(1);
    expect(results[0].targetDocId).toBeNull();
  });

  it('cross-document block ref (targetDocId set) uses targetDocId as owner key', () => {
    const ref: CrossBlockRef = {
      sourceDocId: id('alpha'),
      targetDocId: id('other-doc'),
      anchorId: 'remote-anchor',
      entry: makeWikiLinkEntry('other-doc', { blockRef: 'remote-anchor' }),
      resolvedAnchor: null,
      diagnostic: null,
    };
    refGraph.addBlockRef(ref);

    // Owner key is targetDocId
    const results = refGraph.getBlockRefsToAnchor(id('other-doc'), 'remote-anchor');
    expect(results).toHaveLength(1);
    // Should NOT be findable via sourceDocId
    expect(refGraph.getBlockRefsToAnchor(id('alpha'), 'remote-anchor')).toHaveLength(0);
  });
});
