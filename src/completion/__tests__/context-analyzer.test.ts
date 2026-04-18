import { describe, it, expect, beforeEach } from '@jest/globals';
import { ContextAnalyzer } from '../context-analyzer.js';

describe('ContextAnalyzer', () => {
  let analyzer: ContextAnalyzer;

  beforeEach(() => {
    analyzer = new ContextAnalyzer();
  });

  // ── wiki-link-block ──────────────────────────────────────────────────────────

  describe('wiki-link-block', () => {
    it('detects [[#^ with empty targetStem', () => {
      const text = '[[#^';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-block');
      if (result.kind === 'wiki-link-block') {
        expect(result.targetStem).toBe('');
        expect(result.blockPrefix).toBe('');
      }
    });

    it('detects [[stem#^ with targetStem', () => {
      const text = '[[myDoc#^';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-block');
      if (result.kind === 'wiki-link-block') {
        expect(result.targetStem).toBe('myDoc');
        expect(result.blockPrefix).toBe('');
      }
    });

    it('detects [[stem#^partial with blockPrefix', () => {
      const text = '[[myDoc#^abc';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-block');
      if (result.kind === 'wiki-link-block') {
        expect(result.targetStem).toBe('myDoc');
        expect(result.blockPrefix).toBe('abc');
      }
    });

    it('detects [[#^partial with empty targetStem', () => {
      const text = '[[#^ref';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-block');
      if (result.kind === 'wiki-link-block') {
        expect(result.targetStem).toBe('');
        expect(result.blockPrefix).toBe('ref');
      }
    });
  });

  // ── wiki-link-heading ────────────────────────────────────────────────────────

  describe('wiki-link-heading', () => {
    it('detects [[# with empty targetStem', () => {
      const text = '[[#';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-heading');
      if (result.kind === 'wiki-link-heading') {
        expect(result.targetStem).toBe('');
        expect(result.headingPrefix).toBe('');
      }
    });

    it('detects [[stem# with targetStem', () => {
      const text = '[[myDoc#';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-heading');
      if (result.kind === 'wiki-link-heading') {
        expect(result.targetStem).toBe('myDoc');
        expect(result.headingPrefix).toBe('');
      }
    });

    it('detects [[stem#heading with headingPrefix', () => {
      const text = '[[myDoc#Intro';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-heading');
      if (result.kind === 'wiki-link-heading') {
        expect(result.targetStem).toBe('myDoc');
        expect(result.headingPrefix).toBe('Intro');
      }
    });

    it('detects [[#heading with empty targetStem and headingPrefix', () => {
      const text = '[[#Overview';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link-heading');
      if (result.kind === 'wiki-link-heading') {
        expect(result.targetStem).toBe('');
        expect(result.headingPrefix).toBe('Overview');
      }
    });
  });

  // ── embed ────────────────────────────────────────────────────────────────────

  describe('embed', () => {
    it('detects ![[', () => {
      const text = '![[';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('embed');
      if (result.kind === 'embed') {
        expect(result.partial).toBe('');
      }
    });

    it('detects ![[partial with partial text', () => {
      const text = '![[image';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('embed');
      if (result.kind === 'embed') {
        expect(result.partial).toBe('image');
      }
    });
  });

  // ── wiki-link ────────────────────────────────────────────────────────────────

  describe('wiki-link', () => {
    it('detects [[ trigger', () => {
      const text = '[[';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link');
      if (result.kind === 'wiki-link') {
        expect(result.partial).toBe('');
      }
    });

    it('detects [[partial', () => {
      const text = '[[myDoc';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('wiki-link');
      if (result.kind === 'wiki-link') {
        expect(result.partial).toBe('myDoc');
      }
    });
  });

  // ── tag ──────────────────────────────────────────────────────────────────────

  describe('tag', () => {
    it('detects # at beginning of text', () => {
      const text = '#';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('tag');
      if (result.kind === 'tag') {
        expect(result.partial).toBe('');
      }
    });

    it('detects # after whitespace', () => {
      const text = 'foo #bar';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('tag');
      if (result.kind === 'tag') {
        expect(result.partial).toBe('bar');
      }
    });

    it('detects # after start of line (newline)', () => {
      const text = 'first line\n#tag';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('tag');
      if (result.kind === 'tag') {
        expect(result.partial).toBe('tag');
      }
    });

    it('does not detect # in the middle of a word as a tag', () => {
      // '#' preceded by alphanumeric should not be a tag trigger
      const text = 'word#notag';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('none');
    });
  });

  // ── callout ──────────────────────────────────────────────────────────────────

  describe('callout', () => {
    it('detects > [! trigger', () => {
      const text = '> [!';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('callout');
      if (result.kind === 'callout') {
        expect(result.partial).toBe('');
      }
    });

    it('detects > [!NOTE partial', () => {
      const text = '> [!NOTE';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('callout');
      if (result.kind === 'callout') {
        expect(result.partial).toBe('NOTE');
      }
    });
  });

  // ── none ─────────────────────────────────────────────────────────────────────

  describe('none', () => {
    it('returns none for plain text', () => {
      const text = 'hello world';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('none');
    });

    it('returns none for empty text', () => {
      const result = analyzer.analyze('', 0);
      expect(result.kind).toBe('none');
    });

    it('returns none when offset is before trigger', () => {
      const text = '[[doc';
      // offset at position 0 — nothing typed yet
      const result = analyzer.analyze(text, 0);
      expect(result.kind).toBe('none');
    });

    it('returns none for completed wiki link (closed bracket)', () => {
      const text = '[[doc]]';
      const result = analyzer.analyze(text, text.length);
      expect(result.kind).toBe('none');
    });
  });

  // ── mid-document offset ──────────────────────────────────────────────────────

  describe('mid-document offset', () => {
    it('analyzes at a mid-text offset, ignoring content after cursor', () => {
      // cursor is right after [[my
      const text = '[[myDoc]] some other text';
      const offset = '[[myDoc'.length; // position 7 → inside the link
      const result = analyzer.analyze(text, offset);
      expect(result.kind).toBe('wiki-link');
      if (result.kind === 'wiki-link') {
        expect(result.partial).toBe('myDoc');
      }
    });
  });
});
