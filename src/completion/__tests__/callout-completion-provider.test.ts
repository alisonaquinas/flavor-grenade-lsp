import { describe, it, expect, beforeEach } from '@jest/globals';
import { CalloutCompletionProvider } from '../callout-completion-provider.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDocWithCallouts(
  uri: string,
  calloutTypes: string[],
): OFMDoc {
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
      callouts: calloutTypes.map((type) => ({
        type,
        depth: 1,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      })),
      headings: [],
    },
  };
}

describe('CalloutCompletionProvider', () => {
  let vaultIndex: VaultIndex;
  let provider: CalloutCompletionProvider;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    provider = new CalloutCompletionProvider(vaultIndex);
  });

  // ── standard callouts ─────────────────────────────────────────────────────────

  describe('standard callouts', () => {
    it('returns all standard callouts when partial is empty', () => {
      const { items, isIncomplete } = provider.getCompletions('');

      const labels = items.map((i) => i.label);
      expect(labels).toContain('NOTE');
      expect(labels).toContain('TIP');
      expect(labels).toContain('IMPORTANT');
      expect(labels).toContain('WARNING');
      expect(labels).toContain('CAUTION');
      expect(labels).toContain('DANGER');
      expect(labels).toContain('INFO');
      expect(labels).toContain('TODO');
      expect(labels).toContain('EXAMPLE');
      expect(labels).toContain('QUESTION');
      expect(labels).toContain('QUOTE');
      expect(labels).toContain('ABSTRACT');
      expect(labels).toContain('SUCCESS');
      expect(isIncomplete).toBe(false);
    });

    it('filters standard callouts by partial (case-insensitive)', () => {
      const { items } = provider.getCompletions('no');
      const labels = items.map((i) => i.label);
      expect(labels).toContain('NOTE');
      // TIP does not start with 'no'
      expect(labels).not.toContain('TIP');
    });

    it('filters with uppercase partial', () => {
      const { items } = provider.getCompletions('WARN');
      expect(items.map((i) => i.label)).toContain('WARNING');
    });
  });

  // ── custom callouts from vault ────────────────────────────────────────────────

  describe('custom callout types from vault', () => {
    it('includes custom callout types from vaultIndex', () => {
      vaultIndex.set(
        id('doc'),
        makeDocWithCallouts('file:///v/doc.md', ['CUSTOM', 'SPECIAL']),
      );

      const { items } = provider.getCompletions('');
      const labels = items.map((i) => i.label);

      expect(labels).toContain('CUSTOM');
      expect(labels).toContain('SPECIAL');
    });

    it('deduplicates custom callouts matching standard ones', () => {
      vaultIndex.set(
        id('doc'),
        makeDocWithCallouts('file:///v/doc.md', ['NOTE', 'CUSTOM']),
      );

      const { items } = provider.getCompletions('');
      const noteItems = items.filter((i) => i.label === 'NOTE');
      expect(noteItems).toHaveLength(1);
    });

    it('filters custom callouts by partial', () => {
      vaultIndex.set(
        id('doc'),
        makeDocWithCallouts('file:///v/doc.md', ['CUSTOM', 'OTHER']),
      );

      const { items } = provider.getCompletions('cus');
      expect(items.map((i) => i.label)).toContain('CUSTOM');
      expect(items.map((i) => i.label)).not.toContain('OTHER');
    });
  });

  // ── completion item shape ─────────────────────────────────────────────────────

  describe('completion item properties', () => {
    it('produces items with kind=20 (EnumMember)', () => {
      const { items } = provider.getCompletions('NOTE');
      expect(items[0].kind).toBe(20);
    });

    it('produces insertText as "TYPE] "', () => {
      const { items } = provider.getCompletions('NOTE');
      const noteItem = items.find((i) => i.label === 'NOTE');
      expect(noteItem?.insertText).toBe('NOTE] ');
    });
  });
});
