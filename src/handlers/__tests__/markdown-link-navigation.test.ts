import { describe, it, expect, beforeEach } from '@jest/globals';
import type { Location } from 'vscode-languageserver-types';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { EmbedResolver } from '../../resolution/embed-resolver.js';
import { Oracle } from '../../resolution/oracle.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import type { DocId } from '../../vault/doc-id.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { DefinitionHandler } from '../definition.handler.js';
import { ReferencesHandler } from '../references.handler.js';

function id(value: string): DocId {
  return value as DocId;
}

describe('Markdown link navigation', () => {
  let parser: OFMParser;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;
  let parseCache: ParseCache;
  let definitionHandler: DefinitionHandler;
  let referencesHandler: ReferencesHandler;

  beforeEach(() => {
    parser = new OFMParser();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
    parseCache = new ParseCache();
    const vaultScanner = {
      hasAsset: () => false,
      getAssetIndex: () => new Set<string>(),
    } as unknown as VaultScanner;
    const embedResolver = new EmbedResolver(oracle, vaultScanner);
    definitionHandler = new DefinitionHandler(oracle, embedResolver, parseCache, vaultIndex);
    referencesHandler = new ReferencesHandler(refGraph, parseCache, vaultIndex);
  });

  it('goes to definition for inline Markdown file links', () => {
    const source = parser.parse('file:///vault/notes/source.md', '[Alpha](alpha.md)', 1);
    const alpha = parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1);
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.set(id('notes/alpha'), alpha);
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    const result = definitionHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.markdownLinks[0].targetRange.start,
    }) as Location | null;

    expect(result?.uri).toBe(alpha.uri);
  });

  it('goes to definition for same-document Markdown heading anchors', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '# Link Index\n\n[Links](#link-index)',
      1,
    );
    vaultIndex.set(id('notes/source'), source);
    folderLookup.rebuild(vaultIndex);
    parseCache.set(source.uri, source);

    const result = definitionHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.markdownLinks[0].targetRange.start,
    }) as Location | null;

    expect(result?.range).toEqual(source.index.headings[0].range);
  });

  it('goes to definition from label uses to same-document label definitions', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '[Alpha][alpha-ref]\n\n[alpha-ref]: alpha.md',
      1,
    );
    const alpha = parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1);
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.set(id('notes/alpha'), alpha);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);
    parseCache.set(source.uri, source);

    const result = definitionHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.linkLabelRefs[0].labelRange.start,
    }) as Location | null;

    expect(result?.uri).toBe(source.uri);
    expect(result?.range).toEqual(source.index.linkLabelDefs[0].range);
  });

  it('finds Markdown heading anchors when requesting references on a heading', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '# Link Index\n\n[Links](#link-index)',
      1,
    );
    vaultIndex.set(id('notes/source'), source);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);
    parseCache.set(source.uri, source);

    const refs = referencesHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.headings[0].range.start,
      context: { includeDeclaration: false },
    });

    expect(refs.map((ref) => ref.range)).toContainEqual(source.index.markdownLinks[0].range);
  });

  it('finds same-document label uses when requesting references on a label definition', () => {
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '[Alpha][alpha-ref]\n\n[alpha-ref]: alpha.md',
      1,
    );
    const alpha = parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1);
    vaultIndex.set(id('notes/source'), source);
    vaultIndex.set(id('notes/alpha'), alpha);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);
    parseCache.set(source.uri, source);

    const refs = referencesHandler.handle({
      textDocument: { uri: source.uri },
      position: source.index.linkLabelDefs[0].labelRange.start,
      context: { includeDeclaration: false },
    });

    expect(refs).toHaveLength(1);
    expect(refs[0].range).toEqual(source.index.linkLabelRefs[0].range);
  });
});
