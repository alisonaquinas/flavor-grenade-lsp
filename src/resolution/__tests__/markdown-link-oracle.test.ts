import { describe, it, expect, beforeEach } from '@jest/globals';
import { OFMParser } from '../../parser/ofm-parser.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { DocId } from '../../vault/doc-id.js';
import { classifyMarkdownTarget } from '../markdown-target-classifier.js';
import { Oracle } from '../oracle.js';
import { headingAnchorForText, normalizeHeadingAnchor } from '../heading-anchor.js';

function id(value: string): DocId {
  return value as DocId;
}

describe('Oracle Markdown target resolution', () => {
  let parser: OFMParser;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;

  beforeEach(() => {
    parser = new OFMParser();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
  });

  it('normalizes and emits heading anchors consistently', () => {
    expect(headingAnchorForText('Link Index')).toBe('Link-Index');
    expect(normalizeHeadingAnchor('link index')).toBe('link-index');
    expect(normalizeHeadingAnchor('Link-Index')).toBe('link-index');
  });

  it('resolves local Markdown file targets to DocIds', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '[Alpha](alpha.md)', 1),
    );
    vaultIndex.set(id('notes/alpha'), parser.parse('file:///vault/notes/alpha.md', '# Alpha', 1));
    folderLookup.rebuild(vaultIndex);

    const classification = classifyMarkdownTarget('alpha.md', { sourceDocId: id('notes/source') });

    expect(oracle.resolveMarkdownTarget(id('notes/source'), classification)).toMatchObject({
      kind: 'document-resolved',
      targetDocId: 'notes/alpha',
    });
  });

  it('resolves same-document heading fragments by normalized anchor', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '# Link Index\n\n[Links](#link-index)', 1),
    );
    folderLookup.rebuild(vaultIndex);

    const classification = classifyMarkdownTarget('#link-index', {
      sourceDocId: id('notes/source'),
    });

    expect(oracle.resolveMarkdownTarget(id('notes/source'), classification)).toMatchObject({
      kind: 'heading-resolved',
      targetDocId: 'notes/source',
      normalizedAnchor: 'link-index',
    });
  });

  it('resolves file-plus-heading fragments by normalized anchor', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '[Overview](alpha.md#overview)', 1),
    );
    vaultIndex.set(
      id('notes/alpha'),
      parser.parse('file:///vault/notes/alpha.md', '## Overview', 1),
    );
    folderLookup.rebuild(vaultIndex);

    const classification = classifyMarkdownTarget('alpha.md#overview', {
      sourceDocId: id('notes/source'),
    });

    expect(oracle.resolveMarkdownTarget(id('notes/source'), classification)).toMatchObject({
      kind: 'heading-resolved',
      targetDocId: 'notes/alpha',
      normalizedAnchor: 'overview',
    });
  });

  it('reports missing and ambiguous heading fragments explicitly', () => {
    vaultIndex.set(
      id('notes/source'),
      parser.parse('file:///vault/notes/source.md', '# Overview\n## Overview', 1),
    );
    folderLookup.rebuild(vaultIndex);

    expect(
      oracle.resolveMarkdownTarget(
        id('notes/source'),
        classifyMarkdownTarget('#Missing', { sourceDocId: id('notes/source') }),
      ),
    ).toMatchObject({ kind: 'heading-missing', fragment: 'Missing' });

    const ambiguous = oracle.resolveMarkdownTarget(
      id('notes/source'),
      classifyMarkdownTarget('#Overview', { sourceDocId: id('notes/source') }),
    );
    expect(ambiguous).toMatchObject({ kind: 'heading-ambiguous', fragment: 'Overview' });
    expect(ambiguous.kind === 'heading-ambiguous' ? ambiguous.candidates : []).toHaveLength(2);
  });
});
