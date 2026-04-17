import { describe, it, expect } from '@jest/globals';
import { EmbedParser } from '../embed-parser.js';

describe('EmbedParser', () => {
  const noRegions = [] as const;

  it('parses a simple embed', () => {
    const text = '![[MyNote]]';
    const entries = EmbedParser.parse(text, noRegions);
    expect(entries).toHaveLength(1);
    expect(entries[0].target).toBe('MyNote');
    expect(entries[0].raw).toBe('![[MyNote]]');
  });

  it('parses an image embed with width', () => {
    const entries = EmbedParser.parse('![[photo.png|200]]', noRegions);
    expect(entries[0].target).toBe('photo.png');
    expect(entries[0].width).toBe(200);
    expect(entries[0].height).toBeUndefined();
  });

  it('parses an image embed with width x height', () => {
    const entries = EmbedParser.parse('![[photo.jpg|200x150]]', noRegions);
    expect(entries[0].target).toBe('photo.jpg');
    expect(entries[0].width).toBe(200);
    expect(entries[0].height).toBe(150);
  });

  it('parses a non-image embed with alias', () => {
    const entries = EmbedParser.parse('![[Note|Alias]]', noRegions);
    expect(entries[0].target).toBe('Note');
    expect(entries[0].alias).toBe('Alias');
    expect(entries[0].width).toBeUndefined();
  });

  it('skips embeds inside opaque regions', () => {
    const text = '`![[NotAnEmbed]]`';
    const regions = [{ kind: 'code' as const, start: 0, end: text.length }];
    expect(EmbedParser.parse(text, regions)).toHaveLength(0);
  });

  it('returns correct LSP range', () => {
    const text = 'Before\n![[Image.png]]';
    const entries = EmbedParser.parse(text, noRegions);
    expect(entries[0].range.start.line).toBe(1);
    expect(entries[0].range.start.character).toBe(0);
  });

  it('image extensions: png, jpg, gif, svg, webp treated as images', () => {
    for (const ext of ['png', 'jpg', 'gif', 'svg', 'webp']) {
      const entries = EmbedParser.parse(`![[photo.${ext}|100]]`, noRegions);
      expect(entries[0].width).toBe(100);
    }
  });
});
