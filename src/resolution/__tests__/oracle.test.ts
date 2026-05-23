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

  describe('Obsidian-style target normalization and fuzzy paths', () => {
    it('normalizes backslashes and trailing .md before matching', () => {
      vaultIndex.set(id('notes/alpha'), makeDoc('file:///vault/notes/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('notes\\alpha.md');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('notes/alpha');
      }
    });

    it('resolves exact DocId paths case-insensitively', () => {
      vaultIndex.set(id('notes/Other'), makeDoc('file:///vault/notes/Other.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('NOTES/other');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('notes/Other');
      }
    });

    it('resolves path-like targets by suffix on path boundaries', () => {
      vaultIndex.set(id('wiki/sources/foo'), makeDoc('file:///vault/wiki/sources/foo.md'));
      vaultIndex.set(
        id('raw/upnote/Some Note'),
        makeDoc('file:///vault/raw/upnote/Some%20Note.md'),
      );
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('sources/foo');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('wiki/sources/foo');
      }
    });

    it('resolves path-suffix targets case-insensitively', () => {
      vaultIndex.set(id('wiki/sources/foo'), makeDoc('file:///vault/wiki/sources/foo.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('Sources/FOO');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('wiki/sources/foo');
      }
    });

    it('does not match partial path components during suffix resolution', () => {
      vaultIndex.set(id('super-sources/foo'), makeDoc('file:///vault/super-sources/foo.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('sources/foo');
      expect(result.kind).toBe('broken');
      if (result.kind === 'broken') {
        expect(result.diagnosticCode).toBe('FG001');
      }
    });

    it('returns FG002 when path-suffix resolution has multiple candidates', () => {
      vaultIndex.set(id('wiki/sources/foo'), makeDoc('file:///vault/wiki/sources/foo.md'));
      vaultIndex.set(id('other/sources/foo'), makeDoc('file:///vault/other/sources/foo.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('sources/foo');
      expect(result.kind).toBe('ambiguous');
      if (result.kind === 'ambiguous') {
        expect(result.diagnosticCode).toBe('FG002');
        expect(result.candidates).toEqual(['wiki/sources/foo', 'other/sources/foo']);
      }
    });

    it('resolves bare stems case-insensitively', () => {
      vaultIndex.set(id('wiki/Foo'), makeDoc('file:///vault/wiki/Foo.md'));
      folderLookup.rebuild(vaultIndex);

      const result = oracle.resolve('foo');
      expect(result.kind).toBe('resolved');
      if (result.kind === 'resolved') {
        expect(result.targetDocId).toBe('wiki/Foo');
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
