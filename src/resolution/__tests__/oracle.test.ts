import { describe, it, expect, beforeEach } from '@jest/globals';
import { Oracle } from '../oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDoc(uri: string, aliases?: string[]): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: aliases ? { aliases } : null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

describe('Oracle', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
  });

  describe('malformed', () => {
    it('returns FG003 for empty target', () => {
      const result = oracle.resolve('');
      expect(result.kind).toBe('malformed');
      if (result.kind === 'malformed') {
        expect(result.diagnosticCode).toBe('FG003');
      }
    });

    it('returns FG003 for whitespace-only target', () => {
      const result = oracle.resolve('   ');
      expect(result.kind).toBe('malformed');
      if (result.kind === 'malformed') {
        expect(result.diagnosticCode).toBe('FG003');
      }
    });
  });

  describe('exact path match', () => {
    it('resolves a target that exactly matches a DocId', () => {
      vaultIndex.set(id('notes/alpha'), makeDoc('file:///vault/notes/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('notes/alpha');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('notes/alpha');
      }
    });

    it('resolves a target with heading fragment', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('alpha', 'My Heading');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('alpha');
        expect(result.headingTarget).toBe('My Heading');
      }
    });

    it('resolves a target with block reference', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('alpha', undefined, 'block-id');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('alpha');
        expect(result.blockTarget).toBe('block-id');
      }
    });
  });

  describe('alias match', () => {
    it('resolves a target that matches a frontmatter alias (case-insensitive)', () => {
      vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md', ['The Beta']));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('the beta');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('beta');
      }
    });

    it('alias match is case-insensitive', () => {
      vaultIndex.set(id('beta'), makeDoc('file:///vault/beta.md', ['THE BETA']));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('the beta');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('beta');
      }
    });
  });

  describe('stem match', () => {
    it('resolves a unique stem match', () => {
      vaultIndex.set(id('notes/gamma'), makeDoc('file:///vault/notes/gamma.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('gamma');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('notes/gamma');
      }
    });

    it('returns FG002 for ambiguous stem (multiple matches)', () => {
      vaultIndex.set(id('notes/gamma'), makeDoc('file:///vault/notes/gamma.md'));
      vaultIndex.set(id('other/gamma'), makeDoc('file:///vault/other/gamma.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('gamma');
      expect(result.kind).toBe('ambiguous');
      if (result.kind === 'ambiguous') {
        expect(result.diagnosticCode).toBe('FG002');
        expect(result.candidates).toContain('notes/gamma');
        expect(result.candidates).toContain('other/gamma');
      }
    });

    it('returns FG001 for zero matches (broken)', () => {
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('nonexistent');
      expect(result.kind).toBe('broken');
      if (result.kind === 'broken') {
        expect(result.diagnosticCode).toBe('FG001');
        expect(result.reason).toBe('not-found');
      }
    });
  });

  describe('resolution order', () => {
    it('prefers exact path match over stem match', () => {
      // exact path 'notes/gamma' exists and stem 'gamma' also exists
      vaultIndex.set(id('notes/gamma'), makeDoc('file:///vault/notes/gamma.md'));
      vaultIndex.set(id('other/gamma'), makeDoc('file:///vault/other/gamma.md'));
      folderLookup.rebuild(vaultIndex);

      // 'notes/gamma' as target should resolve via exact path, not ambiguous stem
      const result = oracle.resolve('notes/gamma');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('notes/gamma');
      }
    });

    it('prefers alias over stem when alias matches', () => {
      vaultIndex.set(id('notes/gamma'), makeDoc('file:///vault/notes/gamma.md', ['gamma']));
      vaultIndex.set(id('other/gamma'), makeDoc('file:///vault/other/gamma.md'));
      folderLookup.rebuild(vaultIndex);

      // 'gamma' as alias for 'notes/gamma' should beat stem resolution
      const result = oracle.resolve('gamma');
      // Alias takes priority and resolves uniquely
      expect(result.kind).toBe('resolved');
    });
  });
});
