import { describe, it, expect } from '@jest/globals';
import { OFMParser } from '../ofm-parser.js';

const SAMPLE_DOC = `---
title: Test Document
tags: [obsidian, test]
---
# Introduction

This is a test document with #many #features.

Here is a wiki link: [[OtherNote]] and an embed: ![[image.png|200x150]]

Some $inline math$ and a display block:

$$
E = mc^2
$$

\`\`\`typescript
const x = 1;
\`\`\`

%%This is a comment%%

> [!NOTE]+ Important
> This is a callout body.

A paragraph with a block anchor. ^my-block

## Section Two

See also [[AnotherNote#Heading|Alias Text]] and ![[diagram.svg|400]].

A tag in a code span \`#notag\` should not be found.
`;

describe('OFMParser integration', () => {
  const parser = new OFMParser();

  it('parses a multi-feature document without throwing', () => {
    expect(() => parser.parse('test://doc.md', SAMPLE_DOC, 1)).not.toThrow();
  });

  it('returns correct uri and version', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 42);
    expect(doc.uri).toBe('test://doc.md');
    expect(doc.version).toBe(42);
  });

  it('extracts frontmatter', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    expect(doc.frontmatter).not.toBeNull();
    expect((doc.frontmatter as Record<string, unknown>)['title']).toBe('Test Document');
  });

  it('frontmatterEndOffset is past the closing ---', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    expect(doc.frontmatterEndOffset).toBeGreaterThan(0);
    expect(SAMPLE_DOC[doc.frontmatterEndOffset - 1]).toBe('\n');
  });

  it('extracts headings', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    expect(doc.index.headings.length).toBeGreaterThanOrEqual(2);
    expect(doc.index.headings[0].level).toBe(1);
    expect(doc.index.headings[0].text).toBe('Introduction');
    expect(doc.index.headings[1].level).toBe(2);
    expect(doc.index.headings[1].text).toBe('Section Two');
  });

  it('extracts tags (not inside code spans)', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const tagNames = doc.index.tags.map((t) => t.tag);
    expect(tagNames).toContain('#many');
    expect(tagNames).toContain('#features');
    // #notag is inside a code span and should be excluded
    expect(tagNames).not.toContain('#notag');
  });

  it('extracts wiki links', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const targets = doc.index.wikiLinks.map((w) => w.target);
    expect(targets).toContain('OtherNote');
    expect(targets).toContain('AnotherNote');
  });

  it('extracts wiki link with heading and alias', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const link = doc.index.wikiLinks.find((w) => w.target === 'AnotherNote');
    expect(link?.heading).toBe('Heading');
    expect(link?.alias).toBe('Alias Text');
  });

  it('extracts embeds', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const targets = doc.index.embeds.map((e) => e.target);
    expect(targets).toContain('image.png');
    expect(targets).toContain('diagram.svg');
  });

  it('image embed has size parsed', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const img = doc.index.embeds.find((e) => e.target === 'image.png');
    expect(img?.width).toBe(200);
    expect(img?.height).toBe(150);
  });

  it('extracts block anchors', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const ids = doc.index.blockAnchors.map((b) => b.id);
    expect(ids).toContain('my-block');
  });

  it('extracts callouts', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    expect(doc.index.callouts.length).toBeGreaterThanOrEqual(1);
    expect(doc.index.callouts[0].type).toBe('NOTE');
    expect(doc.index.callouts[0].foldable).toBe('+');
    expect(doc.index.callouts[0].title).toBe('Important');
  });

  it('opaque regions include math and code', () => {
    const doc = parser.parse('test://doc.md', SAMPLE_DOC, 1);
    const kinds = doc.opaqueRegions.map((r) => r.kind);
    expect(kinds).toContain('math');
    expect(kinds).toContain('code');
    expect(kinds).toContain('comment');
  });
});
