import { describe, expect, it } from 'vitest';

import {
  conceptWikiPages,
  validateConceptWiki,
} from '../src/content/wiki';

describe('Karpathy-style LLM wiki concept pages', () => {
  it('publishes the initial concept map', () => {
    expect(conceptWikiPages.map((page) => page.id)).toEqual([
      'inspiration-and-prior-art',
      'obsidian-flavored-markdown',
      'vault-index',
      'wiki-link-resolution',
      'docid-vault-relative-paths',
      'opaque-regions',
      'diagnostics',
      'completions',
      'rename-safety',
      'references-navigation-tags-embeds',
    ]);
  });

  it('keeps concept pages compact, linked, public, and example-driven', () => {
    expect(validateConceptWiki(conceptWikiPages)).toEqual([]);
  });
});
