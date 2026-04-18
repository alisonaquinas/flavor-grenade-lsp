import { describe, it, expect, beforeEach } from '@jest/globals';
import { DefinitionHandler } from '../definition.handler.js';
import { Oracle } from '../../resolution/oracle.js';
import { EmbedResolver } from '../../resolution/embed-resolver.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeWikiLink(target: string, startLine = 0, startChar = 0): WikiLinkEntry {
  const linkLen = target.length + 4; // [[target]]
  return {
    raw: `[[${target}]]`,
    target,
    range: {
      start: { line: startLine, character: startChar },
      end: { line: startLine, character: startChar + linkLen },
    },
  };
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

describe('DefinitionHandler', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let parseCache: ParseCache;
  let embedResolver: EmbedResolver;
  let handler: DefinitionHandler;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    parseCache = new ParseCache();
    const vaultScanner = { hasAsset: () => false, getAssetIndex: () => new Set<string>() } as unknown as VaultScanner;
    embedResolver = new EmbedResolver(oracle, vaultScanner);
    handler = new DefinitionHandler(oracle, embedResolver, parseCache);
  });

  it('returns null when document is not in cache', () => {
    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });
    expect(result).toBeNull();
  });

  it('returns null when cursor is not on a wiki-link', () => {
    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('beta', 1, 0)]);
    parseCache.set('file:///vault/alpha.md', doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 }, // line 0, but wiki-link is on line 1
    });
    expect(result).toBeNull();
  });

  it('returns null when oracle cannot resolve the link', () => {
    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('nonexistent')]);
    parseCache.set('file:///vault/alpha.md', doc);
    folderLookup.rebuild(vaultIndex);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });
    expect(result).toBeNull();
  });

  it('returns Location when cursor is on a resolvable wiki-link', () => {
    vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const doc = makeDoc('file:///vault/alpha.md', [makeWikiLink('beta')]);
    parseCache.set('file:///vault/alpha.md', doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    expect(result!.uri).toContain('beta.md');
    expect(result!.range).toBeDefined();
  });

  it('cursor at right edge of wiki-link still resolves', () => {
    vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md'));
    folderLookup.rebuild(vaultIndex);

    const link = makeWikiLink('beta'); // [[beta]] chars 0-8
    const doc = makeDoc('file:///vault/alpha.md', [link]);
    parseCache.set('file:///vault/alpha.md', doc);

    // character 7 is the last char of [[beta]]
    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 7 },
    });

    expect(result).not.toBeNull();
  });
});
