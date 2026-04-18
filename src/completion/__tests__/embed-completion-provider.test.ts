import { describe, it, expect, beforeEach } from '@jest/globals';
import { EmbedCompletionProvider } from '../embed-completion-provider.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDoc(uri: string): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
    },
  };
}

/** Minimal VaultScanner stub that exposes a controllable asset index. */
class StubVaultScanner {
  private assets: Set<string>;

  constructor(assets: string[] = []) {
    this.assets = new Set(assets);
  }

  getAssetIndex(): Set<string> {
    return this.assets;
  }
}

describe('EmbedCompletionProvider', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let provider: EmbedCompletionProvider;

  function makeProvider(assets: string[] = []): EmbedCompletionProvider {
    const scanner = new StubVaultScanner(assets) as unknown as VaultScanner;
    return new EmbedCompletionProvider(folderLookup, scanner, vaultIndex);
  }

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    provider = makeProvider();
  });

  // ── document stems ────────────────────────────────────────────────────────────

  describe('document stems', () => {
    it('returns doc stems from vaultIndex when partial is empty', () => {
      vaultIndex.set(id('notes/alpha'), makeDoc('file:///v/notes/alpha.md'));
      vaultIndex.set(id('beta'), makeDoc('file:///v/beta.md'));
      folderLookup.rebuild(vaultIndex);
      provider = makeProvider();

      const { items } = provider.getCompletions('');

      const labels = items.map((i) => i.label);
      expect(labels).toContain('alpha');
      expect(labels).toContain('beta');
    });

    it('filters doc stems by partial prefix (case-insensitive)', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///v/alpha.md'));
      vaultIndex.set(id('beta'), makeDoc('file:///v/beta.md'));
      folderLookup.rebuild(vaultIndex);
      provider = makeProvider();

      const { items } = provider.getCompletions('al');
      expect(items.map((i) => i.label)).toContain('alpha');
      expect(items.map((i) => i.label)).not.toContain('beta');
    });
  });

  // ── asset paths ───────────────────────────────────────────────────────────────

  describe('asset paths', () => {
    it('includes asset paths from vaultScanner', () => {
      provider = makeProvider(['images/logo.png', 'docs/diagram.svg']);

      const { items } = provider.getCompletions('');
      const labels = items.map((i) => i.label);
      expect(labels).toContain('images/logo.png');
      expect(labels).toContain('docs/diagram.svg');
    });

    it('filters asset paths by partial', () => {
      provider = makeProvider(['images/logo.png', 'audio/sound.mp3']);

      const { items } = provider.getCompletions('im');
      const labels = items.map((i) => i.label);
      expect(labels).toContain('images/logo.png');
      expect(labels).not.toContain('audio/sound.mp3');
    });
  });

  // ── mixed results ─────────────────────────────────────────────────────────────

  describe('mixed doc stems + assets', () => {
    it('combines docs and assets in results', () => {
      vaultIndex.set(id('readme'), makeDoc('file:///v/readme.md'));
      folderLookup.rebuild(vaultIndex);
      provider = makeProvider(['images/banner.png']);

      const { items } = provider.getCompletions('');
      const labels = items.map((i) => i.label);
      expect(labels).toContain('readme');
      expect(labels).toContain('images/banner.png');
    });
  });

  // ── completion item shape ─────────────────────────────────────────────────────

  describe('completion item properties', () => {
    it('produces items with kind=17 (File) for docs', () => {
      vaultIndex.set(id('doc'), makeDoc('file:///v/doc.md'));
      folderLookup.rebuild(vaultIndex);
      provider = makeProvider();

      const { items } = provider.getCompletions('');
      expect(items[0].kind).toBe(17);
    });

    it('produces items with kind=17 (File) for assets', () => {
      provider = makeProvider(['file.pdf']);

      const { items } = provider.getCompletions('');
      expect(items[0].kind).toBe(17);
    });

    it('returns isIncomplete=false when under cap', () => {
      provider = makeProvider();
      const { isIncomplete } = provider.getCompletions('');
      expect(isIncomplete).toBe(false);
    });
  });
});
