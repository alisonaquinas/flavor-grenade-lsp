import { describe, expect, it } from '@jest/globals';
import { matchFgIgnore, parseFgIgnore, shouldPruneDirectoryByFgIgnore } from '../src/index.js';

describe('.fgignore parsing and matching', () => {
  it('parses comments, negation, and escaped leading metacharacters', () => {
    expect(parseFgIgnore('# comment\ndist/**\n!important.md\n\\#literal.md\n')).toEqual([
      { pattern: 'dist/**', negated: false },
      { pattern: 'important.md', negated: true },
      { pattern: '#literal.md', negated: false },
    ]);
  });

  it('applies later negation to re-include files', () => {
    const rules = parseFgIgnore('dist/**/*.md\n!dist/release-notes.md\n');

    expect(matchFgIgnore(rules, 'dist/generated.md')).toBe(true);
    expect(matchFgIgnore(rules, 'dist/release-notes.md')).toBe(false);
  });

  it('keeps directory pruning conservative for file-only wildcard rules', () => {
    expect(shouldPruneDirectoryByFgIgnore(parseFgIgnore('private/\n'), 'private')).toBe(true);
    expect(shouldPruneDirectoryByFgIgnore(parseFgIgnore('private/*\n'), 'private')).toBe(false);
  });
});
