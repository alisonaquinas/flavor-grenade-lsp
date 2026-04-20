import { describe, it, expect, beforeEach } from '@jest/globals';
import { TagRegistry } from '../tag-registry.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, TagEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

const R = (
  startLine: number,
  startChar: number,
  endLine: number,
  endChar: number,
): { start: { line: number; character: number }; end: { line: number; character: number } } => ({
  start: { line: startLine, character: startChar },
  end: { line: endLine, character: endChar },
});

function makeTag(tag: string, line = 0, char = 0): TagEntry {
  return { tag, range: R(line, char, line, char + tag.length) };
}

function makeDoc(uri: string, tags: TagEntry[] = [], frontmatterTags: string[] = []): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: frontmatterTags.length > 0 ? { tags: frontmatterTags } : null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags, callouts: [], headings: [] },
  };
}

describe('TagRegistry', () => {
  let registry: TagRegistry;
  let vaultIndex: VaultIndex;

  beforeEach(() => {
    registry = new TagRegistry();
    vaultIndex = new VaultIndex();
  });

  // ──────────────────────────────────────────────────────────────
  // allTags()
  // ──────────────────────────────────────────────────────────────

  describe('allTags()', () => {
    it('returns empty array when vault is empty', () => {
      registry.rebuild(vaultIndex);
      expect(registry.allTags()).toEqual([]);
    });

    it('returns tags sorted by count descending', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#project'), makeTag('#project')]));
      vaultIndex.set(id('b'), makeDoc('file:///b.md', [makeTag('#project'), makeTag('#work')]));

      registry.rebuild(vaultIndex);
      const tags = registry.allTags();

      expect(tags[0].tag).toBe('#project');
      expect(tags[0].count).toBe(3);
      expect(tags[1].tag).toBe('#work');
      expect(tags[1].count).toBe(1);
    });

    it('includes frontmatter tags in count', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [], ['project', 'work']));
      vaultIndex.set(id('b'), makeDoc('file:///b.md', [makeTag('#project')]));

      registry.rebuild(vaultIndex);
      const tags = registry.allTags();
      const projectEntry = tags.find((t) => t.tag === '#project');

      expect(projectEntry).toBeDefined();
      expect(projectEntry!.count).toBe(2);
    });

    it('deduplicates tags across docs', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#foo')]));
      vaultIndex.set(id('b'), makeDoc('file:///b.md', [makeTag('#foo')]));

      registry.rebuild(vaultIndex);
      const tags = registry.allTags();
      const fooEntries = tags.filter((t) => t.tag === '#foo');

      expect(fooEntries).toHaveLength(1);
      expect(fooEntries[0].count).toBe(2);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // occurrences()
  // ──────────────────────────────────────────────────────────────

  describe('occurrences()', () => {
    it('returns empty array for unknown tag', () => {
      registry.rebuild(vaultIndex);
      expect(registry.occurrences('#nonexistent')).toEqual([]);
    });

    it('returns all inline occurrences for a tag', () => {
      const tagA = makeTag('#project', 1, 5);
      const tagB = makeTag('#project', 3, 0);
      vaultIndex.set(id('note'), makeDoc('file:///note.md', [tagA, tagB]));

      registry.rebuild(vaultIndex);
      const occs = registry.occurrences('#project');

      expect(occs).toHaveLength(2);
      expect(occs[0].docId).toBe('note');
      expect(occs[0].source).toBe('inline');
      expect(occs[0].range).toEqual(tagA.range);
    });

    it('returns frontmatter occurrences with source=frontmatter', () => {
      vaultIndex.set(id('doc'), makeDoc('file:///doc.md', [], ['project']));

      registry.rebuild(vaultIndex);
      const occs = registry.occurrences('#project');

      expect(occs).toHaveLength(1);
      expect(occs[0].source).toBe('frontmatter');
      expect(occs[0].docId).toBe('doc');
    });

    it('spans across multiple docs', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#shared')]));
      vaultIndex.set(id('b'), makeDoc('file:///b.md', [makeTag('#shared')]));

      registry.rebuild(vaultIndex);
      const occs = registry.occurrences('#shared');

      expect(occs).toHaveLength(2);
      const docIds = occs.map((o) => o.docId).sort();
      expect(docIds).toEqual(['a', 'b']);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // tagsWithPrefix()
  // ──────────────────────────────────────────────────────────────

  describe('tagsWithPrefix()', () => {
    it('returns empty when no tags match', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#work')]));
      registry.rebuild(vaultIndex);
      expect(registry.tagsWithPrefix('proj')).toEqual([]);
    });

    it('returns matching tags for prefix', () => {
      vaultIndex.set(
        id('a'),
        makeDoc('file:///a.md', [
          makeTag('#project'),
          makeTag('#project/active'),
          makeTag('#work'),
        ]),
      );
      registry.rebuild(vaultIndex);
      const result = registry.tagsWithPrefix('proj');
      expect(result).toContain('#project');
      expect(result).toContain('#project/active');
      expect(result).not.toContain('#work');
    });

    it('strips leading # from prefix when matching', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#foo')]));
      registry.rebuild(vaultIndex);
      // tagsWithPrefix should accept partial without '#'
      expect(registry.tagsWithPrefix('fo')).toContain('#foo');
    });

    it('empty prefix returns all tags', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#alpha'), makeTag('#beta')]));
      registry.rebuild(vaultIndex);
      const result = registry.tagsWithPrefix('');
      expect(result).toContain('#alpha');
      expect(result).toContain('#beta');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // hierarchy()
  // ──────────────────────────────────────────────────────────────

  describe('hierarchy()', () => {
    it('returns empty array when no tags', () => {
      registry.rebuild(vaultIndex);
      expect(registry.hierarchy()).toEqual([]);
    });

    it('builds flat tree for non-nested tags', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#work'), makeTag('#home')]));
      registry.rebuild(vaultIndex);
      const tree = registry.hierarchy();
      const segments = tree.map((n) => n.segment).sort();
      expect(segments).toEqual(['home', 'work']);
    });

    it('builds nested tree for slash-delimited tags', () => {
      vaultIndex.set(
        id('a'),
        makeDoc('file:///a.md', [makeTag('#project/active'), makeTag('#project/inactive')]),
      );
      registry.rebuild(vaultIndex);
      const tree = registry.hierarchy();
      const projectNode = tree.find((n) => n.segment === 'project');
      expect(projectNode).toBeDefined();
      expect(projectNode!.children).toHaveLength(2);
      const childSegments = projectNode!.children.map((c) => c.segment).sort();
      expect(childSegments).toEqual(['active', 'inactive']);
    });

    it('aggregates counts up the tree', () => {
      vaultIndex.set(
        id('a'),
        makeDoc('file:///a.md', [
          makeTag('#project/active'),
          makeTag('#project/active'),
          makeTag('#project/inactive'),
        ]),
      );
      registry.rebuild(vaultIndex);
      const tree = registry.hierarchy();
      const projectNode = tree.find((n) => n.segment === 'project');
      expect(projectNode).toBeDefined();
      // parent count = sum of all descendant occurrences
      expect(projectNode!.count).toBeGreaterThanOrEqual(3);
    });

    it('fullTag is the complete slash-delimited path from root', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [makeTag('#a/b/c')]));
      registry.rebuild(vaultIndex);

      const tree = registry.hierarchy();
      const aNode = tree.find((n) => n.segment === 'a');
      expect(aNode).toBeDefined();
      expect(aNode!.fullTag).toBe('#a');

      const bNode = aNode!.children.find((n) => n.segment === 'b');
      expect(bNode).toBeDefined();
      expect(bNode!.fullTag).toBe('#a/b');

      const cNode = bNode!.children.find((n) => n.segment === 'c');
      expect(cNode).toBeDefined();
      expect(cNode!.fullTag).toBe('#a/b/c');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // addDoc() / removeDoc() incremental updates
  // ──────────────────────────────────────────────────────────────

  describe('addDoc() / removeDoc()', () => {
    it('addDoc adds occurrences to the registry', () => {
      registry.rebuild(vaultIndex);
      const doc = makeDoc('file:///new.md', [makeTag('#fresh')]);
      registry.addDoc(id('new'), doc);

      expect(registry.occurrences('#fresh')).toHaveLength(1);
      expect(registry.allTags().find((t) => t.tag === '#fresh')).toBeDefined();
    });

    it('removeDoc removes all occurrences for a docId', () => {
      const doc = makeDoc('file:///x.md', [makeTag('#gone')]);
      vaultIndex.set(id('x'), doc);
      registry.rebuild(vaultIndex);

      expect(registry.occurrences('#gone')).toHaveLength(1);
      registry.removeDoc(id('x'));
      expect(registry.occurrences('#gone')).toHaveLength(0);
    });

    it('removeDoc only removes occurrences for that docId', () => {
      vaultIndex.set(id('x'), makeDoc('file:///x.md', [makeTag('#shared')]));
      vaultIndex.set(id('y'), makeDoc('file:///y.md', [makeTag('#shared')]));
      registry.rebuild(vaultIndex);

      registry.removeDoc(id('x'));
      expect(registry.occurrences('#shared')).toHaveLength(1);
      expect(registry.occurrences('#shared')[0].docId).toBe('y');
    });

    it('addDoc replaces previous entries for same docId (idempotent upsert)', () => {
      const doc1 = makeDoc('file:///z.md', [makeTag('#alpha')]);
      registry.addDoc(id('z'), doc1);

      const doc2 = makeDoc('file:///z.md', [makeTag('#beta')]);
      registry.addDoc(id('z'), doc2);

      expect(registry.occurrences('#alpha')).toHaveLength(0);
      expect(registry.occurrences('#beta')).toHaveLength(1);
    });

    it('addDoc indexes frontmatter tags', () => {
      const doc = makeDoc('file:///fm.md', [], ['project', 'work']);
      registry.addDoc(id('fm'), doc);

      const occs = registry.occurrences('#project');
      expect(occs).toHaveLength(1);
      expect(occs[0].source).toBe('frontmatter');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // frontmatter tags in rebuild()
  // ──────────────────────────────────────────────────────────────

  describe('frontmatter tags in rebuild()', () => {
    it('includes frontmatter tags array in rebuild', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [], ['research', 'daily']));
      registry.rebuild(vaultIndex);

      expect(registry.occurrences('#research')).toHaveLength(1);
      expect(registry.occurrences('#daily')).toHaveLength(1);
    });

    it('frontmatter tags appear in allTags()', () => {
      vaultIndex.set(id('a'), makeDoc('file:///a.md', [], ['fm-only']));
      registry.rebuild(vaultIndex);

      const all = registry.allTags();
      expect(all.find((t) => t.tag === '#fm-only')).toBeDefined();
    });

    it('handles non-array frontmatter.tags gracefully', () => {
      const doc = makeDoc('file:///a.md');
      (doc.frontmatter as Record<string, unknown>) = { tags: 'not-an-array' };
      vaultIndex.set(id('a'), doc);

      expect(() => registry.rebuild(vaultIndex)).not.toThrow();
    });

    it('handles null frontmatter gracefully', () => {
      const doc = makeDoc('file:///a.md');
      vaultIndex.set(id('a'), doc);

      expect(() => registry.rebuild(vaultIndex)).not.toThrow();
    });
  });
});
