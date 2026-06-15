import { describe, expect, it } from '@jest/globals';
import { applyMdfAttributes, parseMdfAttributes } from '../src/index.js';

describe('.mdfattributes parsing and matching', () => {
  it('parses flavor and structured profile assignments', () => {
    expect(
      parseMdfAttributes('*.md flavor=gfm structured_profiles=keep-a-changelog,madr\n'),
    ).toEqual([
      {
        pattern: '*.md',
        negated: false,
        assignments: [
          { kind: 'set', key: 'flavor', value: 'gfm' },
          { kind: 'set', key: 'structuredProfiles', value: ['keep-a-changelog', 'madr'] },
        ],
      },
    ]);
  });

  it('applies local overrides and reset tokens over inherited attributes', () => {
    const inherited = { flavor: 'commonmark' as const, structuredProfiles: ['madr'] as const };
    const rules = parseMdfAttributes('*.md flavor=gfm\nprivate.md !flavor !structured_profiles\n');

    expect(applyMdfAttributes(rules, 'guide.md', inherited)).toEqual({
      flavor: 'gfm',
      structuredProfiles: ['madr'],
    });
    expect(applyMdfAttributes(rules, 'private.md', inherited)).toEqual({});
  });

  it('ignores dangerous and invalid assignment keys', () => {
    const rules = parseMdfAttributes(
      'unsafe.md __proto__=polluted constructor=bad flavor=unknown structured_profiles=keep-a-changelog,common-changelog\n',
    );

    expect(applyMdfAttributes(rules, 'unsafe.md')).toEqual({});
  });
});
