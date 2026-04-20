import { describe, it, expect, beforeEach } from '@jest/globals';
import { HeadingCompletionProvider } from '../heading-completion-provider.js';
import { Oracle } from '../../resolution/oracle.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDoc(uri: string, headings: Array<{ level: number; text: string }> = []): OFMDoc {
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
      headings: headings.map((h) => ({
        level: h.level,
        text: h.text,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      })),
    },
  };
}

describe('HeadingCompletionProvider', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let provider: HeadingCompletionProvider;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    provider = new HeadingCompletionProvider(oracle, vaultIndex);
  });

  // ── intra-document (empty targetStem) ────────────────────────────────────────

  describe('intra-document heading completion', () => {
    it('returns headings from currentDocId when targetStem is empty', () => {
      const docId = id('notes');
      const doc = makeDoc('file:///v/notes.md', [
        { level: 1, text: 'Overview' },
        { level: 2, text: 'Details' },
      ]);
      vaultIndex.set(docId, doc);
      folderLookup.rebuild(vaultIndex);

      const { items, isIncomplete } = provider.getCompletions('', '', docId);

      expect(items).toHaveLength(2);
      expect(items[0].label).toBe('Overview');
      expect(items[1].label).toBe('Details');
      expect(isIncomplete).toBe(false);
    });

    it('filters headings by headingPrefix (case-insensitive)', () => {
      const docId = id('notes');
      const doc = makeDoc('file:///v/notes.md', [
        { level: 1, text: 'Overview' },
        { level: 2, text: 'Outro' },
        { level: 2, text: 'Details' },
      ]);
      vaultIndex.set(docId, doc);
      folderLookup.rebuild(vaultIndex);

      const { items } = provider.getCompletions('', 'ov', docId);

      expect(items).toHaveLength(1);
      expect(items[0].label).toBe('Overview');
    });

    it('returns empty when currentDocId is not found', () => {
      const { items } = provider.getCompletions('', '', id('missing'));
      expect(items).toHaveLength(0);
    });
  });

  // ── cross-document (targetStem provided) ─────────────────────────────────────

  describe('cross-document heading completion', () => {
    it('returns headings from resolved target document', () => {
      const docId = id('guide');
      const doc = makeDoc('file:///v/guide.md', [
        { level: 1, text: 'Introduction' },
        { level: 2, text: 'Installation' },
      ]);
      vaultIndex.set(docId, doc);
      folderLookup.rebuild(vaultIndex);

      const { items } = provider.getCompletions('guide', '');

      expect(items).toHaveLength(2);
      expect(items.map((i) => i.label)).toContain('Introduction');
      expect(items.map((i) => i.label)).toContain('Installation');
    });

    it('filters cross-doc headings by headingPrefix', () => {
      const docId = id('guide');
      const doc = makeDoc('file:///v/guide.md', [
        { level: 1, text: 'Introduction' },
        { level: 2, text: 'Installation' },
        { level: 3, text: 'Usage' },
      ]);
      vaultIndex.set(docId, doc);
      folderLookup.rebuild(vaultIndex);

      const { items } = provider.getCompletions('guide', 'In');

      expect(items).toHaveLength(2);
      expect(items.map((i) => i.label)).not.toContain('Usage');
    });

    it('returns empty when target doc is not found', () => {
      const { items } = provider.getCompletions('nonexistent', '');
      expect(items).toHaveLength(0);
    });
  });

  // ── completion item shape ─────────────────────────────────────────────────────

  describe('completion item properties', () => {
    it('produces items with kind=18 (Reference)', () => {
      const docId = id('doc');
      vaultIndex.set(docId, makeDoc('file:///v/doc.md', [{ level: 1, text: 'Section' }]));
      folderLookup.rebuild(vaultIndex);

      const { items } = provider.getCompletions('', '', docId);

      expect(items[0].kind).toBe(18);
    });

    it('produces insertText with stem#headingText for cross-doc', () => {
      const docId = id('guide');
      vaultIndex.set(docId, makeDoc('file:///v/guide.md', [{ level: 1, text: 'Overview' }]));
      folderLookup.rebuild(vaultIndex);

      const { items } = provider.getCompletions('guide', '');

      expect(items[0].insertText).toBe('guide#Overview');
    });

    it('produces insertText with just headingText for intra-doc', () => {
      const docId = id('doc');
      vaultIndex.set(docId, makeDoc('file:///v/doc.md', [{ level: 2, text: 'My Section' }]));
      folderLookup.rebuild(vaultIndex);

      const { items } = provider.getCompletions('', '', docId);

      expect(items[0].insertText).toBe('My Section');
    });
  });
});
