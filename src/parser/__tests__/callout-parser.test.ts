import { describe, it, expect } from '@jest/globals';
import { CalloutParser } from '../callout-parser.js';

describe('CalloutParser', () => {
  it('parses a simple callout', () => {
    const text = '> [!NOTE]\n> Content';
    const entries = CalloutParser.parse(text);
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe('NOTE');
    expect(entries[0].depth).toBe(1);
    expect(entries[0].foldable).toBeUndefined();
    expect(entries[0].title).toBeUndefined();
  });

  it('parses callout with foldable + indicator', () => {
    const entries = CalloutParser.parse('> [!TIP]+\n> Body');
    expect(entries[0].foldable).toBe('+');
  });

  it('parses callout with foldable - indicator', () => {
    const entries = CalloutParser.parse('> [!WARNING]-\n> Body');
    expect(entries[0].foldable).toBe('-');
  });

  it('parses callout with title text', () => {
    const entries = CalloutParser.parse('> [!NOTE] My Title\n> Body');
    expect(entries[0].title).toBe('My Title');
  });

  it('parses callout with fold and title', () => {
    const entries = CalloutParser.parse('> [!INFO]+ Custom Title\n> Body');
    expect(entries[0].foldable).toBe('+');
    expect(entries[0].title).toBe('Custom Title');
  });

  it('parses nested callout depth 2', () => {
    const text = '>> [!NOTE]\n>> Content';
    const entries = CalloutParser.parse(text);
    expect(entries[0].depth).toBe(2);
  });

  it('returns empty for non-callout blockquote', () => {
    const entries = CalloutParser.parse('> Normal blockquote');
    expect(entries).toHaveLength(0);
  });

  it('returns correct LSP range (start of line)', () => {
    const text = 'Before\n> [!NOTE]\n> Content';
    const entries = CalloutParser.parse(text);
    expect(entries[0].range.start.line).toBe(1);
    expect(entries[0].range.start.character).toBe(0);
  });

  it('finds multiple callouts', () => {
    const text = '> [!NOTE]\n> text\n\n> [!TIP]\n> more';
    const entries = CalloutParser.parse(text);
    expect(entries).toHaveLength(2);
  });

  it('type is case-preserved', () => {
    const entries = CalloutParser.parse('> [!abstract]\n> content');
    expect(entries[0].type).toBe('abstract');
  });
});
