import { describe, it, expect, beforeEach } from '@jest/globals';
import { LinkResolver } from '../link-resolver.js';
import { Oracle } from '../oracle.js';
import { RefGraph } from '../ref-graph.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, WikiLinkEntry, BlockAnchorEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

const ZERO_RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 10 },
};

function makeDoc(uri: string, blockAnchors: BlockAnchorEntry[] = []): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: { wikiLinks: [], embeds: [], blockAnchors, tags: [], callouts: [], headings: [] },
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

describe('block references', () => {
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

  it('intra-doc blockRef, anchor exists: resolvedTo is null, crossRef stored with resolvedAnchor and no diagnostic', () => {
    const anchor: BlockAnchorEntry = { id: 'my-anchor', range: ZERO_RANGE };
    vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md', [anchor]));
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle, vaultIndex, refGraph);
    const entry: WikiLinkEntry = {
      raw: '[[#^my-anchor]]',
      target: '',
      blockRef: 'my-anchor',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();

    const stored = refGraph.getBlockRefsToAnchor(id('alpha'), 'my-anchor');
    expect(stored).toHaveLength(1);
    expect(stored[0].resolvedAnchor).toBe(anchor);
    expect(stored[0].diagnostic).toBeNull();
    expect(stored[0].targetDocId).toBeNull();
  });

  it('intra-doc blockRef, anchor missing: resolvedTo is null, crossRef stored with resolvedAnchor null and FG005', () => {
    vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle, vaultIndex, refGraph);
    const entry: WikiLinkEntry = {
      raw: '[[#^missing]]',
      target: '',
      blockRef: 'missing',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();

    const stored = refGraph.getBlockRefsToAnchor(id('alpha'), 'missing');
    expect(stored).toHaveLength(1);
    expect(stored[0].resolvedAnchor).toBeNull();
    expect(stored[0].diagnostic).toBe('FG005');
    expect(refGraph.getBrokenBlockRefs()).toHaveLength(1);
  });

  it('intra-doc blockRef, no vaultIndex or refGraph: does not throw, resolvedTo is null', () => {
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle);
    const entry: WikiLinkEntry = {
      raw: '[[#^any]]',
      target: '',
      blockRef: 'any',
      range: ZERO_RANGE,
    };

    expect(() => resolver.resolveLink(entry, id('alpha'))).not.toThrow();
    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();
  });

  it('cross-doc blockRef, target resolves, anchor exists: resolvedTo is target, crossRef stored with resolvedAnchor and no diagnostic', () => {
    const anchor: BlockAnchorEntry = { id: 'note', range: ZERO_RANGE };
    vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md', [anchor]));
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle, vaultIndex, refGraph);
    const entry: WikiLinkEntry = {
      raw: '[[beta#^note]]',
      target: 'beta',
      blockRef: 'note',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBe('beta');

    const stored = refGraph.getBlockRefsToAnchor(id('beta'), 'note');
    expect(stored).toHaveLength(1);
    expect(stored[0].resolvedAnchor).toBe(anchor);
    expect(stored[0].diagnostic).toBeNull();
    expect(stored[0].targetDocId).toBe('beta');
  });

  it('cross-doc blockRef, target resolves, anchor missing: resolvedTo is target, crossRef stored with resolvedAnchor null and FG005', () => {
    vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle, vaultIndex, refGraph);
    const entry: WikiLinkEntry = {
      raw: '[[beta#^ghost]]',
      target: 'beta',
      blockRef: 'ghost',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBe('beta');

    const stored = refGraph.getBlockRefsToAnchor(id('beta'), 'ghost');
    expect(stored).toHaveLength(1);
    expect(stored[0].resolvedAnchor).toBeNull();
    expect(stored[0].diagnostic).toBe('FG005');
    expect(refGraph.getBrokenBlockRefs()).toHaveLength(1);
  });

  it('cross-doc blockRef, target does not resolve: resolvedTo is null, no crossRef added to refGraph', () => {
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle, vaultIndex, refGraph);
    const entry: WikiLinkEntry = {
      raw: '[[beta#^any]]',
      target: 'beta',
      blockRef: 'any',
      range: ZERO_RANGE,
    };

    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBeNull();

    expect(refGraph.getBlockRefsToAnchor(id('beta'), 'any')).toHaveLength(0);
    expect(refGraph.getBrokenBlockRefs()).toHaveLength(0);
  });

  it('cross-doc blockRef, no refGraph: resolvedTo is target, does not throw', () => {
    vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const resolver = new LinkResolver(oracle, vaultIndex);
    const entry: WikiLinkEntry = {
      raw: '[[beta#^note]]',
      target: 'beta',
      blockRef: 'note',
      range: ZERO_RANGE,
    };

    expect(() => resolver.resolveLink(entry, id('alpha'))).not.toThrow();
    const ref = resolver.resolveLink(entry, id('alpha'));
    expect(ref.resolvedTo).toBe('beta');
  });
});
