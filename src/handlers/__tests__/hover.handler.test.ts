import { describe, it, expect, beforeEach } from '@jest/globals';
import { HoverHandler } from '../hover.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, EmbedEntry, WikiLinkEntry, HeadingEntry } from '../../parser/types.js';
import type { EmbedResolution } from '../../resolution/embed-resolver.js';
import type { EmbedResolver } from '../../resolution/embed-resolver.js';
import type { DocId } from '../../vault/doc-id.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function id(s: string): DocId {
  return s as DocId;
}

function makeHeading(text: string, level = 1, line = 0): HeadingEntry {
  return {
    level,
    text,
    range: {
      start: { line, character: 0 },
      end: { line, character: text.length + level + 1 },
    },
  };
}

function makeEmbed(target: string, startLine = 0, startChar = 0, endLine?: number): EmbedEntry {
  const finalEndLine = endLine ?? startLine;
  const tokenLen = target.length + 5; // ![[target]]
  return {
    raw: `![[${target}]]`,
    target,
    range: {
      start: { line: startLine, character: startChar },
      end: { line: finalEndLine, character: startChar + tokenLen },
    },
  };
}

function makeWikiLink(target: string, startLine = 0, startChar = 0): WikiLinkEntry {
  const linkLen = target.length + 4; // [[target]]
  return {
    raw: `[[${target}]]`,
    target,
    range: {
      start: { line: startLine, character: startChar },
      end: { line: startLine, character: startChar + linkLen },
    },
  };
}

function makeDoc(
  uri: string,
  headings: HeadingEntry[] = [],
  wikiLinks: WikiLinkEntry[] = [],
  embeds: EmbedEntry[] = [],
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: { wikiLinks, embeds, blockAnchors: [], tags: [], callouts: [], headings },
  };
}

function makeMockEmbedResolver(resolution: EmbedResolution): EmbedResolver {
  return { resolve: () => resolution } as unknown as EmbedResolver;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HoverHandler', () => {
  let parseCache: ParseCache;
  let vaultIndex: VaultIndex;
  let handler: HoverHandler;

  // Default resolver returns broken; individual tests override as needed.
  let embedResolver: EmbedResolver;

  beforeEach(() => {
    parseCache = new ParseCache();
    vaultIndex = new VaultIndex();
    embedResolver = makeMockEmbedResolver({ kind: 'broken' });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);
  });

  // -------------------------------------------------------------------------
  // 1. handle() returns null when URI not in parse cache
  // -------------------------------------------------------------------------
  it('returns null when the document URI is not in the parse cache', () => {
    const result = handler.handle({
      textDocument: { uri: 'file:///vault/missing.md' },
      position: { line: 0, character: 0 },
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 2. handle() returns null when cursor is on neither embed nor wiki-link
  // -------------------------------------------------------------------------
  it('returns null when cursor is not over any embed or wiki-link', () => {
    const doc = makeDoc('file:///vault/alpha.md');
    parseCache.set('file:///vault/alpha.md', doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 5, character: 10 },
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 3. Embed → markdown resolution → returns fenced preview with headings
  // -------------------------------------------------------------------------
  it('returns fenced markdown preview when cursor is on an embed that resolves to a markdown doc with headings', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [
      makeHeading('Introduction', 2, 0),
      makeHeading('Summary', 2, 5),
    ]);

    vaultIndex.set(targetId, betaDoc);
    parseCache.set('file:///vault/beta.md', betaDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('beta');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    expect(result!.contents.kind).toBe('markdown');
    expect(result!.contents.value).toContain('```markdown');
    expect(result!.contents.value).toContain('## Introduction');
    expect(result!.contents.value).toContain('## Summary');
  });

  // -------------------------------------------------------------------------
  // 4. Embed → markdown resolution → target not in vaultIndex → null
  // -------------------------------------------------------------------------
  it('returns null when the embed target docId is not in vaultIndex', () => {
    // vaultIndex has no entry for 'ghost'
    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: id('ghost') });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('ghost');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 5. Embed → markdown resolution → target in vaultIndex but NOT in parseCache → null
  // -------------------------------------------------------------------------
  it('returns null when the embed target is in vaultIndex but not in parseCache', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [makeHeading('Intro', 1, 0)]);

    // Put doc in vaultIndex only — not in parseCache
    vaultIndex.set(targetId, betaDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('beta');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 6. Embed → markdown resolution → target has no headings → docId as preview
  // -------------------------------------------------------------------------
  it('uses docId as preview when the embed target doc has no headings', () => {
    const targetId = id('notes/empty-note');
    const emptyDoc = makeDoc('file:///vault/notes/empty-note.md', []); // no headings

    vaultIndex.set(targetId, emptyDoc);
    parseCache.set('file:///vault/notes/empty-note.md', emptyDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('notes/empty-note');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    expect(result!.contents.kind).toBe('markdown');
    expect(result!.contents.value).toContain('notes/empty-note');
  });

  // -------------------------------------------------------------------------
  // 7. Embed → asset resolution → returns ![](uri) markdown
  // -------------------------------------------------------------------------
  it('returns an image markdown link when the embed resolves to an asset', () => {
    embedResolver = makeMockEmbedResolver({ kind: 'asset', assetPath: '/vault/images/photo.png' });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('images/photo.png');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    expect(result!.contents.kind).toBe('markdown');
    // The value should be an image markdown link referencing the asset URI
    expect(result!.contents.value).toMatch(/^!\[\]\(file:\/\/\//);
    expect(result!.contents.value).toContain('photo.png');
  });

  // -------------------------------------------------------------------------
  // 8. Embed → broken resolution → null
  // -------------------------------------------------------------------------
  it('returns null when the embed resolves to broken', () => {
    embedResolver = makeMockEmbedResolver({ kind: 'broken' });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('nowhere');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 9. WikiLink → target in vaultIndex+parseCache with headings → returns preview
  // -------------------------------------------------------------------------
  it('returns fenced markdown preview when cursor is on a wiki-link with headings in the target', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [
      makeHeading('Overview', 1, 0),
      makeHeading('Details', 2, 3),
      makeHeading('Conclusion', 1, 7),
    ]);

    vaultIndex.set(targetId, betaDoc);
    parseCache.set('file:///vault/beta.md', betaDoc);

    const wikiLink = makeWikiLink('beta'); // [[beta]] chars 0-7
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [wikiLink]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    expect(result!.contents.kind).toBe('markdown');
    expect(result!.contents.value).toContain('```markdown');
    expect(result!.contents.value).toContain('# Overview');
    // WIKI_LINK_PREVIEW_LINES = 3, so all three headings fit
    expect(result!.contents.value).toContain('## Details');
    expect(result!.contents.value).toContain('# Conclusion');
  });

  // -------------------------------------------------------------------------
  // 10. WikiLink → target not in vaultIndex → null
  // -------------------------------------------------------------------------
  it('returns null when wiki-link target is not in vaultIndex', () => {
    const wikiLink = makeWikiLink('nonexistent');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [wikiLink]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 11. positionInRange boundary: cursor BEFORE start.character on start line → not in range
  // -------------------------------------------------------------------------
  it('does not match embed when cursor is before start.character on start line', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [makeHeading('H', 1, 0)]);
    vaultIndex.set(targetId, betaDoc);
    parseCache.set('file:///vault/beta.md', betaDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    // Embed starts at character 5 on line 0
    const embed = makeEmbed('beta', 0, 5);
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 4 }, // one before start.character=5
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 12. positionInRange boundary: cursor AFTER end.character on end line → not in range
  // -------------------------------------------------------------------------
  it('does not match embed when cursor is after end.character on end line', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [makeHeading('H', 1, 0)]);
    vaultIndex.set(targetId, betaDoc);
    parseCache.set('file:///vault/beta.md', betaDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    // makeEmbed('beta', 0, 0) → end.character = 0 + 'beta'.length + 5 = 9
    const embed = makeEmbed('beta', 0, 0);
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 10 }, // one after end.character=9
    });
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 13. Multi-line embed range: cursor on middle line → in range
  // -------------------------------------------------------------------------
  it('matches a multi-line embed when cursor is on the middle line', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [makeHeading('H', 1, 0)]);
    vaultIndex.set(targetId, betaDoc);
    parseCache.set('file:///vault/beta.md', betaDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    // Manually craft a multi-line embed: starts line 1, ends line 3
    const multiLineEmbed: EmbedEntry = {
      raw: '![[beta]]',
      target: 'beta',
      range: {
        start: { line: 1, character: 0 },
        end: { line: 3, character: 9 },
      },
    };
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [multiLineEmbed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 2, character: 0 }, // middle line of the range
    });

    expect(result).not.toBeNull();
    expect(result!.contents.kind).toBe('markdown');
  });

  // -------------------------------------------------------------------------
  // Additional: MARKDOWN_PREVIEW_LINES cap (embed → markdown): 5-line cap enforced
  // -------------------------------------------------------------------------
  it('caps embed markdown preview at MARKDOWN_PREVIEW_LINES (5) headings', () => {
    const targetId = id('long-doc');
    const longDoc = makeDoc('file:///vault/long-doc.md', [
      makeHeading('H1', 1, 0),
      makeHeading('H2', 1, 1),
      makeHeading('H3', 1, 2),
      makeHeading('H4', 1, 3),
      makeHeading('H5', 1, 4),
      makeHeading('H6', 1, 5), // this one should be excluded
    ]);
    vaultIndex.set(targetId, longDoc);
    parseCache.set('file:///vault/long-doc.md', longDoc);

    embedResolver = makeMockEmbedResolver({ kind: 'markdown', targetDocId: targetId });
    handler = new HoverHandler(parseCache, vaultIndex, embedResolver);

    const embed = makeEmbed('long-doc');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [], [embed]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    const value = result!.contents.value;
    expect(value).toContain('# H5');
    expect(value).not.toContain('# H6');
  });

  // -------------------------------------------------------------------------
  // Additional: WIKI_LINK_PREVIEW_LINES cap (wiki-link): 3-line cap enforced
  // -------------------------------------------------------------------------
  it('caps wiki-link markdown preview at WIKI_LINK_PREVIEW_LINES (3) headings', () => {
    const targetId = id('beta');
    const betaDoc = makeDoc('file:///vault/beta.md', [
      makeHeading('H1', 1, 0),
      makeHeading('H2', 1, 1),
      makeHeading('H3', 1, 2),
      makeHeading('H4', 1, 3), // should be excluded
    ]);
    vaultIndex.set(targetId, betaDoc);
    parseCache.set('file:///vault/beta.md', betaDoc);

    const wikiLink = makeWikiLink('beta');
    const sourceDoc = makeDoc('file:///vault/alpha.md', [], [wikiLink]);
    parseCache.set('file:///vault/alpha.md', sourceDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 2 },
    });

    expect(result).not.toBeNull();
    const value = result!.contents.value;
    expect(value).toContain('# H3');
    expect(value).not.toContain('# H4');
  });
});
