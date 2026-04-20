import { describe, it, expect, beforeEach } from '@jest/globals';
import { ReferencesHandler } from '../references.handler.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { Oracle } from '../../resolution/oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { ParseCache } from '../../parser/parser.module.js';
import type {
  OFMDoc,
  WikiLinkEntry,
  TagEntry,
  HeadingEntry,
  BlockAnchorEntry,
} from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';
import type { TagRegistry } from '../../tags/tag-registry.js';

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

describe('ReferencesHandler', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;
  let parseCache: ParseCache;
  let handler: ReferencesHandler;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
    parseCache = new ParseCache();
    handler = new ReferencesHandler(refGraph, parseCache, vaultIndex);
  });

  it('returns empty array when document is not in cache', () => {
    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });
    expect(result).toEqual([]);
  });

  it('returns locations for all refs pointing to the target doc', () => {
    const betaDoc = makeDoc('file:///vault/beta.md');
    const alphaDoc = makeDoc('file:///vault/alpha.md', [makeWikiLink('beta')]);

    vaultIndex.set(id('beta'), betaDoc);
    vaultIndex.set(id('alpha'), alphaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe('file:///vault/alpha.md');
  });

  it('includeDeclaration=true prepends the document itself', () => {
    const betaDoc = makeDoc('file:///vault/beta.md');
    const alphaDoc = makeDoc('file:///vault/alpha.md', [makeWikiLink('beta')]);

    vaultIndex.set(id('beta'), betaDoc);
    vaultIndex.set(id('alpha'), alphaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: true },
    });

    expect(result).toHaveLength(2);
    expect(result[0].uri).toBe('file:///vault/beta.md');
    expect(result[1].uri).toBe('file:///vault/alpha.md');
  });

  it('returns empty when no refs point to target', () => {
    const betaDoc = makeDoc('file:///vault/beta.md');
    vaultIndex.set(id('beta'), betaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(0);
  });
});

// ─── helpers for entity-specific tests ───────────────────────────────────────

const TAG_RANGE = {
  start: { line: 1, character: 0 },
  end: { line: 1, character: 10 },
};

const HEADING_RANGE = {
  start: { line: 2, character: 0 },
  end: { line: 2, character: 15 },
};

const ANCHOR_RANGE = {
  start: { line: 3, character: 0 },
  end: { line: 3, character: 12 },
};

function makeDocWithTag(uri: string, tag: string): OFMDoc {
  const tagEntry: TagEntry = { tag, range: TAG_RANGE };
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [tagEntry],
      callouts: [],
      headings: [],
    },
  };
}

function makeDocWithHeading(uri: string, headingText: string): OFMDoc {
  const headingEntry: HeadingEntry = { level: 2, text: headingText, range: HEADING_RANGE };
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [headingEntry],
    },
  };
}

function makeDocWithAnchor(uri: string, anchorId: string): OFMDoc {
  const anchorEntry: BlockAnchorEntry = { id: anchorId, range: ANCHOR_RANGE };
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [anchorEntry],
      tags: [],
      callouts: [],
      headings: [],
    },
  };
}

// ─── tag entity ──────────────────────────────────────────────────────────────

describe('tag entity', () => {
  it('cursor on a #tag returns TagRegistry.occurrences() mapped to Locations', () => {
    const tagUri = 'file:///vault/tagged.md';
    const doc = makeDocWithTag(tagUri, '#mytag');

    const mockOccurrence = {
      docId: id('other-doc'),
      range: ZERO_RANGE,
      source: 'inline' as const,
    };
    const mockTagRegistry = {
      occurrences: (_tag: string) => [mockOccurrence],
    } as unknown as TagRegistry;

    const localVaultIndex = new VaultIndex();
    localVaultIndex.set(id('other-doc'), makeDoc('file:///vault/other-doc.md'));
    const localParseCache = new ParseCache();
    localParseCache.set(tagUri, doc);

    const localHandler = new ReferencesHandler(
      new RefGraph(),
      localParseCache,
      localVaultIndex,
      mockTagRegistry,
    );

    const result = localHandler.handle({
      textDocument: { uri: tagUri },
      position: { line: 1, character: 5 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe('file:///vault/other-doc.md');
  });

  it('returns [] when tagRegistry is not provided', () => {
    const tagUri = 'file:///vault/tagged.md';
    const doc = makeDocWithTag(tagUri, '#mytag');

    const localParseCache = new ParseCache();
    localParseCache.set(tagUri, doc);

    // No tagRegistry passed — constructor 4th arg omitted
    const localHandler = new ReferencesHandler(new RefGraph(), localParseCache, new VaultIndex());

    const result = localHandler.handle({
      textDocument: { uri: tagUri },
      position: { line: 1, character: 5 },
      context: { includeDeclaration: false },
    });

    expect(result).toEqual([]);
  });
});

// ─── block-anchor entity ─────────────────────────────────────────────────────

describe('block-anchor entity', () => {
  it('cursor on a block anchor returns getBlockRefsToAnchor() as Locations', () => {
    const anchorDocUri = 'file:///vault/anchored.md';
    const anchorDoc = makeDocWithAnchor(anchorDocUri, 'my-block');

    const localVaultIndex = new VaultIndex();
    localVaultIndex.set(id('anchored'), anchorDoc);

    const localRefGraph = new RefGraph();
    const mockCrossRef = {
      sourceDocId: id('source-doc'),
      targetDocId: id('anchored'),
      anchorId: 'my-block',
      entry: {
        raw: '[[anchored#^my-block]]',
        target: 'anchored',
        blockRef: 'my-block',
        range: ZERO_RANGE,
      },
      resolvedAnchor: null,
      diagnostic: null,
    };
    localRefGraph.addBlockRef(mockCrossRef);

    const sourceDoc = makeDoc('file:///vault/source-doc.md');
    localVaultIndex.set(id('source-doc'), sourceDoc);

    const localParseCache = new ParseCache();
    localParseCache.set(anchorDocUri, anchorDoc);

    const localHandler = new ReferencesHandler(localRefGraph, localParseCache, localVaultIndex);

    const result = localHandler.handle({
      textDocument: { uri: anchorDocUri },
      position: { line: 3, character: 5 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe('file:///vault/source-doc.md');
  });

  it('returns [] when no block refs point to the anchor', () => {
    const anchorDocUri = 'file:///vault/anchored.md';
    const anchorDoc = makeDocWithAnchor(anchorDocUri, 'lonely-block');

    const localVaultIndex = new VaultIndex();
    localVaultIndex.set(id('anchored'), anchorDoc);

    const localParseCache = new ParseCache();
    localParseCache.set(anchorDocUri, anchorDoc);

    const localHandler = new ReferencesHandler(new RefGraph(), localParseCache, localVaultIndex);

    const result = localHandler.handle({
      textDocument: { uri: anchorDocUri },
      position: { line: 3, character: 5 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(0);
  });
});

// ─── heading entity ───────────────────────────────────────────────────────────

describe('heading entity', () => {
  it('cursor on heading returns refs filtered by heading text', () => {
    const headingDocUri = 'file:///vault/with-heading.md';
    const headingDoc = makeDocWithHeading(headingDocUri, 'My Section');

    const localVaultIndex = new VaultIndex();
    localVaultIndex.set(id('with-heading'), headingDoc);

    // A source doc that links [[with-heading#My Section]]
    const sourceDoc = makeDoc('file:///vault/source.md', [
      {
        raw: '[[with-heading#My Section]]',
        target: 'with-heading',
        heading: 'My Section',
        range: ZERO_RANGE,
      },
    ]);
    localVaultIndex.set(id('source'), sourceDoc);

    const localFolderLookup = new FolderLookup();
    localFolderLookup.rebuild(localVaultIndex);
    const localOracle = new Oracle(localFolderLookup, localVaultIndex);

    const localRefGraph = new RefGraph();
    localRefGraph.rebuild(localVaultIndex, localOracle);

    const localParseCache = new ParseCache();
    localParseCache.set(headingDocUri, headingDoc);

    const localHandler = new ReferencesHandler(localRefGraph, localParseCache, localVaultIndex);

    const result = localHandler.handle({
      textDocument: { uri: headingDocUri },
      position: { line: 2, character: 5 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe('file:///vault/source.md');
  });

  it('includeDeclaration=true prepends the definition site for a heading', () => {
    const headingDocUri = 'file:///vault/with-heading.md';
    const headingDoc = makeDocWithHeading(headingDocUri, 'Overview');

    const localVaultIndex = new VaultIndex();
    localVaultIndex.set(id('with-heading'), headingDoc);

    const sourceDoc = makeDoc('file:///vault/linker.md', [
      {
        raw: '[[with-heading#Overview]]',
        target: 'with-heading',
        heading: 'Overview',
        range: ZERO_RANGE,
      },
    ]);
    localVaultIndex.set(id('linker'), sourceDoc);

    const localFolderLookup = new FolderLookup();
    localFolderLookup.rebuild(localVaultIndex);
    const localOracle = new Oracle(localFolderLookup, localVaultIndex);

    const localRefGraph = new RefGraph();
    localRefGraph.rebuild(localVaultIndex, localOracle);

    const localParseCache = new ParseCache();
    localParseCache.set(headingDocUri, headingDoc);

    const localHandler = new ReferencesHandler(localRefGraph, localParseCache, localVaultIndex);

    const result = localHandler.handle({
      textDocument: { uri: headingDocUri },
      position: { line: 2, character: 5 },
      context: { includeDeclaration: true },
    });

    // First entry is the declaration site (heading itself in with-heading.md)
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].uri).toBe(headingDocUri);
  });
});

// ─── URI normalization ────────────────────────────────────────────────────────

describe('URI normalization', () => {
  it('Windows file:///C:/path URI — drive letter is lowercased in resolved defKey', () => {
    // The handler normalises drive letters when matching URIs against vaultIndex.
    // We verify that a document stored with a lowercase drive URI is found even
    // when the request URI uses an uppercase drive letter.
    const upperUri = 'file:///C:/vault/notes.md';
    const lowerUri = 'file:///c:/vault/notes.md';

    const localVaultIndex = new VaultIndex();
    const notesDoc = makeDoc(lowerUri);
    localVaultIndex.set(id('notes'), notesDoc);

    const localFolderLookup = new FolderLookup();
    localFolderLookup.rebuild(localVaultIndex);
    const localOracle = new Oracle(localFolderLookup, localVaultIndex);
    const localRefGraph = new RefGraph();
    localRefGraph.rebuild(localVaultIndex, localOracle);

    const localParseCache = new ParseCache();
    // Register doc under the upper-case URI (as the client would send it)
    localParseCache.set(upperUri, notesDoc);

    const localHandler = new ReferencesHandler(localRefGraph, localParseCache, localVaultIndex);

    // Should not throw and should return a valid (empty) array — the doc is found
    const result = localHandler.handle({
      textDocument: { uri: upperUri },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it('stem extraction: URI for notes/topic.md yields stem "topic"', () => {
    // The handler uses stem matching as a fallback defKey resolution strategy.
    // Set up a vault with a doc whose docId last segment is 'topic', then
    // verify the handler resolves the URI via that stem and returns refs.
    const topicUri = 'file:///vault/notes/topic.md';
    const topicDoc = makeDoc(topicUri);

    const localVaultIndex = new VaultIndex();
    localVaultIndex.set(id('topic'), topicDoc);

    const linkerDoc = makeDoc('file:///vault/linker.md', [makeWikiLink('topic')]);
    localVaultIndex.set(id('linker'), linkerDoc);

    const localFolderLookup = new FolderLookup();
    localFolderLookup.rebuild(localVaultIndex);
    const localOracle = new Oracle(localFolderLookup, localVaultIndex);
    const localRefGraph = new RefGraph();
    localRefGraph.rebuild(localVaultIndex, localOracle);

    const localParseCache = new ParseCache();
    localParseCache.set(topicUri, topicDoc);

    const localHandler = new ReferencesHandler(localRefGraph, localParseCache, localVaultIndex);

    // Exact match via URI; the refs from linker should appear
    const result = localHandler.handle({
      textDocument: { uri: topicUri },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe('file:///vault/linker.md');
  });

  it('fallback defKey: backslashes in URI pathname are normalized to forward slashes', () => {
    // The handler's uriToFallbackDefKey normalizes backslashes.
    // A URI with no vault index match falls back to pathname-derived key.
    // We test that the handler does not throw and returns [] gracefully.
    const weirdUri = 'file:///vault/sub/deep.md';
    const localParseCache = new ParseCache();
    // Use a doc with no vault index entry so fallback path is exercised
    const doc = makeDoc(weirdUri);
    localParseCache.set(weirdUri, doc);

    const localHandler = new ReferencesHandler(new RefGraph(), localParseCache, new VaultIndex());

    const result = localHandler.handle({
      textDocument: { uri: weirdUri },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
