import { describe, it, expect, beforeEach } from '@jest/globals';
import { HoverHandler } from '../hover.handler.js';
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

describe('attachment hover', () => {
  let parser: OFMParser;
  let parseCache: ParseCache;
  let vaultIndex: VaultIndex;
  let handler: HoverHandler;

  beforeEach(() => {
    parser = new OFMParser();
    parseCache = new ParseCache();
    vaultIndex = new VaultIndex();
    const folderLookup = new FolderLookup();
    const oracle = new Oracle(folderLookup, vaultIndex);
    const vaultScanner = {
      hasAsset: (target: string) => vaultIndex.hasAttachment(target),
      getAssetIndex: () =>
        new Set(Array.from(vaultIndex.attachments(), (attachment) => attachment.path)),
    } as unknown as VaultScanner;
    const embedResolver = new EmbedResolver(oracle, vaultScanner);
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);
  });

  it('shows metadata for a vault-relative Markdown image attachment from a nested note', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '![Diagram](assets/diagram.png)',
      1,
    );
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///vault/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 42,
      dimensions: { width: 640, height: 480 },
    });
    parseCache.set(source.uri, source);

    const result = handler.handle({
      textDocument: { uri: source.uri },
      position: source.index.markdownImages[0].targetRange.start,
    });

    expect(result?.contents.value).toContain('assets/diagram.png');
    expect(result?.contents.value).toContain('Image');
    expect(result?.contents.value).toContain('42 B');
    expect(result?.contents.value).toContain('640x480');
  });

  it('shows metadata for an embed attachment', () => {
    const source = parser.parse('file:///vault/source.md', '![[files/manual.pdf]]', 1);
    vaultIndex.set(id('source'), source);
    vaultIndex.setAttachment({
      path: 'files/manual.pdf',
      uri: 'file:///vault/files/manual.pdf',
      extension: 'pdf',
      kind: 'pdf',
      sizeBytes: 1024,
    });
    parseCache.set(source.uri, source);

    const result = handler.handle({
      textDocument: { uri: source.uri },
      position: source.index.embeds[0].range.start,
    });

    expect(result?.contents.value).toContain('files/manual.pdf');
    expect(result?.contents.value).toContain('PDF');
    expect(result?.contents.value).toContain('1.0 KB');
  });
});
