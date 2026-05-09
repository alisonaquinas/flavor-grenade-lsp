import { describe, expect, it, beforeEach } from '@jest/globals';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import type { DocId } from '../../vault/doc-id.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { Oracle } from '../../resolution/oracle.js';
import { DocumentLinkHandler } from '../document-link.handler.js';

function id(value: string): DocId {
  return value as DocId;
}

describe('DocumentLinkHandler', () => {
  let parser: OFMParser;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let parseCache: ParseCache;
  let handler: DocumentLinkHandler;

  beforeEach(() => {
    parser = new OFMParser();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    parseCache = new ParseCache();
    handler = new DocumentLinkHandler(parseCache, vaultIndex, oracle);
  });

  it('returns no links when the document is not in the parse cache', () => {
    expect(handler.handle({ textDocument: { uri: 'file:///vault/missing.md' } })).toEqual([]);
  });

  it('returns targets for unambiguous wiki-links and local Markdown links', () => {
    const source = parser.parse('file:///vault/notes/source.md', '[[beta]]\n[Alpha](alpha.md)', 1);
    const beta = parser.parse('file:///vault/notes/beta.md', '# Beta', 1);
    const alpha = parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1);
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.set(id('notes/beta'), beta);
    vaultIndex.set(id('notes/alpha'), alpha);
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    const links = handler.handle({ textDocument: { uri: source.uri } });

    expect(links).toContainEqual({ range: source.index.wikiLinks[0].range, target: beta.uri });
    expect(links).toContainEqual({
      range: source.index.markdownLinks[0].targetRange,
      target: alpha.uri,
    });
  });

  it('omits ambiguous wiki-links and external or vault-escaping Markdown targets', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '[[duplicate]]\n[External](https://example.com)\n[Escape](../../secret.md)',
      1,
    );
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.set(id('one/duplicate'), parser.parse('file:///vault/one/duplicate.md', '# D', 1));
    vaultIndex.set(id('two/duplicate'), parser.parse('file:///vault/two/duplicate.md', '# D', 1));
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    expect(handler.handle({ textDocument: { uri: source.uri } })).toEqual([]);
  });

  it('returns targets for reference-style links and Markdown image attachments', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '[Alpha][alpha-ref]\n\n[alpha-ref]: alpha.md\n\n![Diagram](../assets/diagram.png)',
      1,
    );
    const alpha = parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1);
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.set(id('notes/alpha'), alpha);
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///vault/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 42,
    });
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    const links = handler.handle({ textDocument: { uri: source.uri } });

    expect(links).toContainEqual({
      range: source.index.linkLabelRefs[0].labelRange,
      target: alpha.uri,
    });
    expect(links).toContainEqual({
      range: source.index.linkLabelDefs[0].targetRange,
      target: alpha.uri,
    });
    expect(links).toContainEqual({
      range: source.index.markdownImages[0].targetRange,
      target: 'file:///vault/assets/diagram.png',
    });
  });
});
