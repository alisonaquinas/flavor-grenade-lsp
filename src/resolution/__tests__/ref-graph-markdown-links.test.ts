import { describe, it, expect, beforeEach } from '@jest/globals';
import { OFMParser } from '../../parser/ofm-parser.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { DocId } from '../../vault/doc-id.js';
import { Oracle } from '../oracle.js';
import { RefGraph } from '../ref-graph.js';

function id(value: string): DocId {
  return value as DocId;
}

describe('RefGraph Markdown links', () => {
  let parser: OFMParser;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;

  beforeEach(() => {
    parser = new OFMParser();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
  });

  it('indexes inline local Markdown links as document references', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '[Alpha](alpha.md)', 1),
    );
    vaultIndex.set(id('notes/alpha'), parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const refs = refGraph.getMarkdownRefsTo(id('notes/alpha'));
    expect(refs).toHaveLength(1);
    expect(refs[0].sourceDocId).toBe('notes/source');
    expect(refs[0].entry.target).toBe('alpha.md');
    expect(refs[0].resolvedTo).toBe('notes/alpha');
  });

  it('indexes local Markdown image refs separately from document refs', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '![Diagram](assets/diagram.png)', 1),
    );
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const imageRefs = refGraph.getMarkdownImageRefsTo('notes/assets/diagram.png');
    expect(imageRefs).toHaveLength(1);
    expect(imageRefs[0].entry.target).toBe('assets/diagram.png');
    expect(refGraph.getMarkdownRefsTo(id('notes/assets/diagram'))).toHaveLength(0);
  });

  it('binds reference label uses to same-document definitions case-insensitively', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse(
        'file:///vault/notes/source.md',
        '[Alpha][ALPHA-REF]\n\n[alpha-ref]: alpha.md',
        1,
      ),
    );
    vaultIndex.set(id('notes/alpha'), parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const labelRefs = refGraph.getLabelRefsTo(id('notes/source'), 'alpha-ref');
    expect(labelRefs).toHaveLength(1);
    expect(labelRefs[0].definition?.target).toBe('alpha.md');
    expect(refGraph.getMarkdownRefsTo(id('notes/alpha'))).toHaveLength(1);
  });

  it('does not bind labels across documents', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '[Alpha][shared]', 1),
    );
    vaultIndex.set(
      id('notes/other'),
      parser.parse('file:///vault/notes/other.md', '[shared]: alpha.md', 1),
    );
    vaultIndex.set(id('notes/alpha'), parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    expect(refGraph.getLabelRefsTo(id('notes/source'), 'shared')).toHaveLength(0);
    expect(refGraph.getMarkdownRefsTo(id('notes/alpha'))).toHaveLength(0);
  });

  it('omits external URLs from vault reference entries', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '[External](https://example.com/page)', 1),
    );
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    expect(refGraph.getMarkdownRefsTo(id('https://example.com/page'))).toHaveLength(0);
    expect(refGraph.getUnresolvedMarkdownRefs()).toHaveLength(0);
  });
});
