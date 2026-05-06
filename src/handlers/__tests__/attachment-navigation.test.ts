import { describe, it, expect, beforeEach } from '@jest/globals';
import type { Location } from 'vscode-languageserver-types';
import { DefinitionHandler } from '../definition.handler.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { EmbedResolver } from '../../resolution/embed-resolver.js';
import { Oracle } from '../../resolution/oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { VaultScanner } from '../../vault/vault-scanner.js';
import type { DocId } from '../../vault/doc-id.js';

function id(value: string): DocId {
  return value as DocId;
}

describe('attachment navigation', () => {
  let parser: OFMParser;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let parseCache: ParseCache;
  let definitionHandler: DefinitionHandler;

  beforeEach(() => {
    parser = new OFMParser();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    const oracle = new Oracle(folderLookup, vaultIndex);
    parseCache = new ParseCache();
    const vaultScanner = {
      hasAsset: (target: string) => vaultIndex.hasAttachment(target),
      getAssetIndex: () =>
        new Set(Array.from(vaultIndex.attachments(), (attachment) => attachment.path)),
    } as unknown as VaultScanner;
    const embedResolver = new EmbedResolver(oracle, vaultScanner);
    definitionHandler = new DefinitionHandler(oracle, embedResolver, parseCache, vaultIndex);
  });

  it('goes to the indexed attachment URI from a Markdown image target', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '![Diagram](assets/diagram.png)',
      1,
    );
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///actual/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 42,
    });
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    const result = definitionHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.markdownImages[0].targetRange.start,
    }) as Location | null;

    expect(result?.uri).toBe('file:///actual/assets/diagram.png');
    expect(result?.range).toEqual({
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    });
  });

  it('goes to the indexed attachment URI from an embed target', () => {
    const source = parser.parse('file:///vault/notes/source.md', '![[assets/diagram.png]]', 1);
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///actual/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 42,
    });
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    const result = definitionHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.embeds[0].range.start,
    }) as Location | null;

    expect(result?.uri).toBe('file:///actual/assets/diagram.png');
  });
});
