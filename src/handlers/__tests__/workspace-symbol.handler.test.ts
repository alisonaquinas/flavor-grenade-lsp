import { describe, it, expect, beforeEach } from '@jest/globals';
import { WorkspaceSymbolHandler } from '../workspace-symbol.handler.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import type { OFMDoc, HeadingEntry, TagEntry, BlockAnchorEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeHeading(text: string, level: number, line: number): HeadingEntry {
  return {
    level,
    text,
    range: { start: { line, character: 0 }, end: { line, character: text.length + level + 1 } },
  };
}

function makeTag(tag: string, line: number): TagEntry {
  return {
    tag,
    range: { start: { line, character: 0 }, end: { line, character: tag.length } },
  };
}

function makeAnchor(anchorId: string, line: number): BlockAnchorEntry {
  return {
    id: anchorId,
    range: { start: { line, character: 0 }, end: { line, character: anchorId.length + 1 } },
  };
}

function makeDoc(uri: string, overrides: Partial<OFMDoc['index']> = {}): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text: '',
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      ...overrides,
    },
  };
}

function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

describe('WorkspaceSymbolHandler', () => {
  let vaultIndex: VaultIndex;
  let vaultDetector: VaultDetector;
  let handler: WorkspaceSymbolHandler;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    vaultDetector = makeVaultDetector();
    handler = new WorkspaceSymbolHandler(vaultIndex, vaultDetector);
  });

  it('returns matching headings for prefix query', () => {
    const doc = makeDoc('file:///vault/alpha.md', {
      headings: [makeHeading('Introduction', 2, 0), makeHeading('Getting Started', 2, 2)],
    });
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({ query: 'Intro' });

    expect(Array.isArray(result)).toBe(true);
    const names = result.map((s) => s.name);
    expect(names).toContain('Introduction');
    expect(names).not.toContain('Getting Started');
  });

  it('caps results at 50 items', () => {
    // Add enough headings to exceed cap
    for (let i = 0; i < 60; i++) {
      const doc = makeDoc(`file:///vault/doc${i}.md`, {
        headings: [makeHeading(`Section ${i}`, 2, 0)],
      });
      vaultIndex.set(id(`doc${i}`), doc);
    }

    const result = handler.handle({ query: 'Section' });
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it('returns tags with correct SymbolKind (20)', () => {
    const doc = makeDoc('file:///vault/alpha.md', {
      tags: [makeTag('#todo', 1), makeTag('#done', 2)],
    });
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({ query: 'todo' });

    expect(Array.isArray(result)).toBe(true);
    const tagSymbol = result.find((s) => s.name === 'todo');
    expect(tagSymbol).toBeDefined();
    expect(tagSymbol!.kind).toBe(20); // SymbolKind.Key
  });

  it('returns block anchors with correct SymbolKind (20)', () => {
    const doc = makeDoc('file:///vault/alpha.md', {
      blockAnchors: [makeAnchor('my-anchor', 3)],
    });
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({ query: 'my-anchor' });

    expect(Array.isArray(result)).toBe(true);
    const anchorSymbol = result.find((s) => s.name === 'my-anchor');
    expect(anchorSymbol).toBeDefined();
    expect(anchorSymbol!.kind).toBe(20); // SymbolKind.Key
  });

  it('returns empty array when no matches', () => {
    const doc = makeDoc('file:///vault/alpha.md', {
      headings: [makeHeading('Introduction', 2, 0)],
    });
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({ query: 'XYZ_nonexistent' });
    expect(result).toHaveLength(0);
  });

  it('returns empty array when vault is empty', () => {
    const result = handler.handle({ query: 'any' });
    expect(result).toHaveLength(0);
  });

  it('is case-insensitive in matching', () => {
    const doc = makeDoc('file:///vault/alpha.md', {
      headings: [makeHeading('Introduction', 2, 0)],
    });
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({ query: 'intro' });
    const names = result.map((s) => s.name);
    expect(names).toContain('Introduction');
  });

  it('includes location with uri and range', () => {
    const doc = makeDoc('file:///vault/alpha.md', {
      headings: [makeHeading('Section', 2, 1)],
    });
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({ query: 'Section' });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].location.uri).toBe('file:///vault/alpha.md');
    expect(result[0].location.range).toBeDefined();
  });
});
