import { describe, it, expect } from '@jest/globals';
import { MarkdownLinkParser } from '../markdown-link-parser.js';

describe('MarkdownLinkParser', () => {
  const noRegions = [] as const;

  it('parses inline Markdown links with text and target ranges', () => {
    const text = 'See [Alpha Note](notes/alpha.md#Overview "Alpha title") today.';
    const entries = MarkdownLinkParser.parse(text, noRegions);

    expect(entries.markdownLinks).toHaveLength(1);
    expect(entries.markdownLinks[0]).toMatchObject({
      raw: '[Alpha Note](notes/alpha.md#Overview "Alpha title")',
      text: 'Alpha Note',
      target: 'notes/alpha.md#Overview',
      title: 'Alpha title',
    });
    expect(entries.markdownLinks[0].textRange).toEqual({
      start: { line: 0, character: 5 },
      end: { line: 0, character: 15 },
    });
    expect(entries.markdownLinks[0].targetRange).toEqual({
      start: { line: 0, character: 17 },
      end: { line: 0, character: 40 },
    });
  });

  it('parses Markdown image links separately from document links', () => {
    const entries = MarkdownLinkParser.parse('Look ![Diagram](assets/graph.png)', noRegions);

    expect(entries.markdownLinks).toHaveLength(0);
    expect(entries.markdownImages).toHaveLength(1);
    expect(entries.markdownImages[0]).toMatchObject({
      alt: 'Diagram',
      target: 'assets/graph.png',
    });
  });

  it('parses full, collapsed, and shortcut reference labels', () => {
    const text = '[Alpha][alpha-ref] [Beta][] [Gamma]';
    const entries = MarkdownLinkParser.parse(text, noRegions);

    expect(entries.linkLabelRefs.map((entry) => entry.label)).toEqual([
      'alpha-ref',
      'Beta',
      'Gamma',
    ]);
    expect(entries.linkLabelRefs.map((entry) => entry.normalizedLabel)).toEqual([
      'alpha-ref',
      'beta',
      'gamma',
    ]);
  });

  it('parses reference definitions with target and optional title', () => {
    const text = '[alpha-ref]: notes/alpha.md#Overview "Alpha title"';
    const entries = MarkdownLinkParser.parse(text, noRegions);

    expect(entries.linkLabelDefs).toHaveLength(1);
    expect(entries.linkLabelDefs[0]).toMatchObject({
      label: 'alpha-ref',
      normalizedLabel: 'alpha-ref',
      target: 'notes/alpha.md#Overview',
      title: 'Alpha title',
    });
  });

  it('skips Markdown links inside opaque regions', () => {
    const text = '`[Hidden](secret.md)` [Visible](public.md)';
    const regions = [{ kind: 'code' as const, start: 0, end: 21 }];
    const entries = MarkdownLinkParser.parse(text, regions);

    expect(entries.markdownLinks).toHaveLength(1);
    expect(entries.markdownLinks[0].target).toBe('public.md');
  });

  it('does not parse wiki-links or embeds as shortcut labels', () => {
    const entries = MarkdownLinkParser.parse('[[Wiki]] ![[Embed]] [Real]', noRegions);

    expect(entries.linkLabelRefs).toHaveLength(1);
    expect(entries.linkLabelRefs[0].label).toBe('Real');
  });
});
