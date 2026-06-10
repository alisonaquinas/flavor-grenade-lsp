import { describe, expect, it } from '@jest/globals';
import { matchMdfIgnore, parseMdfIgnore, shouldPruneDirectoryByMdfIgnore } from '../src/index.js';

describe('.mdfignore parsing and matching', () => {
  it('parses comments, negation, and escaped leading metacharacters', () => {
    expect(parseMdfIgnore('# comment\ndist/**\n!important.md\n\\#literal.md\n')).toEqual([
      { pattern: 'dist/**', negated: false },
      { pattern: 'important.md', negated: true },
      { pattern: '#literal.md', negated: false },
    ]);
  });

  it('applies later negation to re-include files', () => {
    const rules = parseMdfIgnore('dist/**/*.md\n!dist/release-notes.md\n');

    expect(matchMdfIgnore(rules, 'dist/generated.md')).toBe(true);
    expect(matchMdfIgnore(rules, 'dist/release-notes.md')).toBe(false);
  });

  it('keeps directory pruning conservative for file-only wildcard rules', () => {
    expect(shouldPruneDirectoryByMdfIgnore(parseMdfIgnore('private/\n'), 'private')).toBe(true);
    expect(shouldPruneDirectoryByMdfIgnore(parseMdfIgnore('private/*\n'), 'private')).toBe(false);
  });
});
