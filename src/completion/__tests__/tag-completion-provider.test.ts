import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { TagCompletionProvider } from '../tag-completion-provider.js';
import { TagRegistry } from '../../tags/tag-registry.js';

// Tags are stored with the '#' sigil in TagRegistry.allTags()
function makeTag(tag: string, count: number): { tag: string; count: number } {
  return { tag, count };
}

describe('TagCompletionProvider', () => {
  let mockTagRegistry: TagRegistry;
  let provider: TagCompletionProvider;

  beforeEach(() => {
    mockTagRegistry = {
      allTags: jest.fn().mockReturnValue([]),
    } as unknown as TagRegistry;
    provider = new TagCompletionProvider(mockTagRegistry);
  });

  it('returns all tags when prefix is empty', () => {
    const tags = [makeTag('#project', 5), makeTag('#work', 3), makeTag('#ideas', 1)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items } = provider.getCompletions('');

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.label)).toEqual(['project', 'work', 'ideas']);
  });

  it('filters tags by prefix (without #)', () => {
    const tags = [makeTag('#project', 5), makeTag('#proj-alt', 2), makeTag('#work', 3)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items } = provider.getCompletions('proj');

    expect(items).toHaveLength(2);
    expect(items.map((i) => i.label)).toEqual(['project', 'proj-alt']);
  });

  it('strips leading # from partial before filtering', () => {
    const tags = [makeTag('#project', 5), makeTag('#proj-alt', 2), makeTag('#work', 3)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items: withHash } = provider.getCompletions('#proj');
    const { items: withoutHash } = provider.getCompletions('proj');

    expect(withHash.map((i) => i.label)).toEqual(withoutHash.map((i) => i.label));
  });

  it('returns empty items and isIncomplete=false when no tags match', () => {
    const tags = [makeTag('#project', 5), makeTag('#work', 3)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items, isIncomplete } = provider.getCompletions('zzz');

    expect(items).toHaveLength(0);
    expect(isIncomplete).toBe(false);
  });

  it('sets isIncomplete=false when matches are fewer than 100', () => {
    // The cap is checked after pushing: items.length >= 100 triggers isIncomplete=true.
    // So only <100 results keeps isIncomplete=false.
    const tags = Array.from({ length: 99 }, (_, i) => makeTag(`#tag${i}`, 1));
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items, isIncomplete } = provider.getCompletions('');

    expect(items).toHaveLength(99);
    expect(isIncomplete).toBe(false);
  });

  it('caps at 100 items and sets isIncomplete=true when matches reach or exceed 100', () => {
    const tags = Array.from({ length: 105 }, (_, i) => makeTag(`#tag${i}`, 1));
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items, isIncomplete } = provider.getCompletions('');

    expect(items).toHaveLength(100);
    expect(isIncomplete).toBe(true);
  });

  it('preserves frequency order from allTags()', () => {
    // allTags() returns descending by count; provider must preserve that order
    const tags = [makeTag('#frequent', 10), makeTag('#medium', 5), makeTag('#rare', 1)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items } = provider.getCompletions('');

    expect(items[0].label).toBe('frequent');
    expect(items[1].label).toBe('medium');
    expect(items[2].label).toBe('rare');
  });

  it('detail is "1 occurrence" (singular) when count is 1', () => {
    const tags = [makeTag('#lonely', 1)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items } = provider.getCompletions('');

    expect(items[0].detail).toBe('1 occurrence');
  });

  it('detail is "N occurrences" (plural) when count is greater than 1', () => {
    const tags = [makeTag('#popular', 42)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items } = provider.getCompletions('');

    expect(items[0].detail).toBe('42 occurrences');
  });

  it('item label has no leading #', () => {
    const tags = [makeTag('#mytag', 3)];
    (mockTagRegistry.allTags as ReturnType<typeof jest.fn>).mockReturnValue(tags);

    const { items } = provider.getCompletions('');

    expect(items[0].label).toBe('mytag');
    expect(items[0].label.startsWith('#')).toBe(false);
  });
});
