import { describe, it, expect, beforeEach } from '@jest/globals';
import { TagToYamlAction } from '../tag-to-yaml.action.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, TagEntry } from '../../parser/types.js';

function makeTag(tag: string, line: number, startChar: number): TagEntry {
  return {
    tag,
    range: {
      start: { line, character: startChar },
      end: { line, character: startChar + tag.length },
    },
  };
}

function makeDoc(uri: string, text: string, overrides: Partial<OFMDoc> = {}): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text,
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
    ...overrides,
  };
}

const DOC_URI = 'file:///vault/test.md';

describe('TagToYamlAction — edge cases', () => {
  let parseCache: ParseCache;
  let action: TagToYamlAction;

  beforeEach(() => {
    parseCache = new ParseCache();
    action = new TagToYamlAction(parseCache);
  });

  describe('tag already in frontmatter', () => {
    it('returns informational action with no WorkspaceEdit when tag already in frontmatter', () => {
      const tagEntry = makeTag('#todo', 5, 0);
      const doc = makeDoc(DOC_URI, '---\ntags: [todo]\n---\nsome text\n#todo item', {
        frontmatter: { tags: ['todo'] },
        frontmatterEndOffset: 20,
        index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [tagEntry], callouts: [], headings: [] },
      });
      parseCache.set(DOC_URI, doc);

      const result = action.handle({
        textDocument: { uri: DOC_URI },
        range: { start: { line: 5, character: 2 }, end: { line: 5, character: 2 } },
      });

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Tag already in frontmatter');
      expect(result!.kind).toBe('');
      expect(result!.edit).toBeUndefined();
    });

    it('returns normal action when tag is in frontmatter object but not as the specific tag', () => {
      const tagEntry = makeTag('#other', 5, 0);
      const doc = makeDoc(DOC_URI, '---\ntags: [todo]\n---\nsome text\n#other item', {
        frontmatter: { tags: ['todo'] },
        frontmatterEndOffset: 20,
        index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [tagEntry], callouts: [], headings: [] },
      });
      parseCache.set(DOC_URI, doc);

      const result = action.handle({
        textDocument: { uri: DOC_URI },
        range: { start: { line: 5, character: 2 }, end: { line: 5, character: 2 } },
      });

      // Should get a real action (append to existing tags array)
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Move #other to frontmatter');
    });
  });

  describe('multiple inline occurrences', () => {
    it('deletes all occurrences of the tag in a single WorkspaceEdit', () => {
      const tag1 = makeTag('#todo', 3, 0);
      const tag2 = makeTag('#todo', 5, 10);
      const tag3 = makeTag('#todo', 7, 0);
      const doc = makeDoc(DOC_URI, 'some doc\n---\n\n#todo first\n\n  some #todo middle\n\n#todo last', {
        frontmatter: null,
        index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [tag1, tag2, tag3], callouts: [], headings: [] },
      });
      parseCache.set(DOC_URI, doc);

      const result = action.handle({
        textDocument: { uri: DOC_URI },
        range: { start: { line: 3, character: 2 }, end: { line: 3, character: 2 } },
      });

      expect(result).not.toBeNull();
      const changes = result!.edit!.changes![DOC_URI];
      expect(changes).toBeDefined();
      // Should have deletions for all 3 occurrences + 1 frontmatter insertion = 4 edits
      const deletions = changes.filter((e) => e.newText === '');
      expect(deletions).toHaveLength(3);
    });

    it('inserts the tag into frontmatter only once even with multiple occurrences', () => {
      const tag1 = makeTag('#todo', 3, 0);
      const tag2 = makeTag('#todo', 4, 0);
      const doc = makeDoc(DOC_URI, 'some doc\n---\n\n#todo first\n#todo second', {
        frontmatter: null,
        index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [tag1, tag2], callouts: [], headings: [] },
      });
      parseCache.set(DOC_URI, doc);

      const result = action.handle({
        textDocument: { uri: DOC_URI },
        range: { start: { line: 3, character: 2 }, end: { line: 3, character: 2 } },
      });

      expect(result).not.toBeNull();
      const changes = result!.edit!.changes![DOC_URI];
      const insertions = changes.filter((e) => e.newText.includes('todo'));
      expect(insertions).toHaveLength(1);
    });
  });

  describe('makeInsertTagsKeyEdit fix', () => {
    it('inserts tags key before closing frontmatter --- line (not at line 0)', () => {
      const tagEntry = makeTag('#newtag', 5, 0);
      const text = '---\ntitle: My Doc\nauthor: Alice\n---\nsome text\n#newtag here';
      const doc = makeDoc(DOC_URI, text, {
        frontmatter: { title: 'My Doc', author: 'Alice' },
        frontmatterEndOffset: 33,
        index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [tagEntry], callouts: [], headings: [] },
      });
      parseCache.set(DOC_URI, doc);

      const result = action.handle({
        textDocument: { uri: DOC_URI },
        range: { start: { line: 5, character: 2 }, end: { line: 5, character: 2 } },
      });

      expect(result).not.toBeNull();
      const changes = result!.edit!.changes![DOC_URI];
      const insertion = changes.find((e) => e.newText.includes('tags'));
      expect(insertion).toBeDefined();
      // The insertion should NOT be at line 0 character 0 (which was the old sentinel)
      expect(insertion!.range.start.line).toBeGreaterThan(0);
    });

    it('appends tag to existing inline tags array on the correct line', () => {
      const tagEntry = makeTag('#extra', 5, 0);
      const text = '---\ntags: [alpha, beta]\n---\nsome text\n\n#extra here';
      const doc = makeDoc(DOC_URI, text, {
        frontmatter: { tags: ['alpha', 'beta'] },
        frontmatterEndOffset: 24,
        index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [tagEntry], callouts: [], headings: [] },
      });
      parseCache.set(DOC_URI, doc);

      const result = action.handle({
        textDocument: { uri: DOC_URI },
        range: { start: { line: 5, character: 2 }, end: { line: 5, character: 2 } },
      });

      expect(result).not.toBeNull();
      const changes = result!.edit!.changes![DOC_URI];
      const tagEdit = changes.find((e) => e.newText.includes('extra') || e.newText.includes('tags'));
      expect(tagEdit).toBeDefined();
      expect(tagEdit!.newText).toContain('extra');
    });
  });
});
